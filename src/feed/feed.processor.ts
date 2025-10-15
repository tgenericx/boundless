import { PrismaService } from '@/prisma/prisma.service';
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { FeedRepairService } from './feed.repair.service';
import { Cron } from '@nestjs/schedule';

export interface FanoutPayload {
  postId: string;
  followerIds: string[];
  createdAt?: number;
}

@Injectable()
export class FeedProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FeedProcessor.name);
  private worker: Worker | null = null;
  private batch: FanoutPayload[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  private readonly BATCH_INTERVAL = 100;
  private readonly MAX_FEED_SIZE = 1000;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly feedRepairService: FeedRepairService,
  ) {}

  onModuleInit(): void {
    this.worker = new Worker<FanoutPayload>(
      'feed',
      async (job: Job<FanoutPayload>) => this.queueFanout(job.data),
      { connection: this.redis, concurrency: 10 },
    );

    this.flushTimer = setInterval((): void => {
      this.flushBatch().catch((err: unknown): void => {
        if (err instanceof Error) {
          this.logger.error(`Batch flush failed: ${err.message}`, err.stack);
        } else {
          this.logger.error(`Batch flush failed: ${JSON.stringify(err)}`);
        }
      });
    }, this.BATCH_INTERVAL);

    this.logger.log('🚀 FeedProcessor ready (BullMQ + micro-batching active)');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.flushTimer) clearInterval(this.flushTimer);
    if (this.worker) {
      await this.worker.close();
      this.logger.log('🛑 FeedProcessor worker closed gracefully');
    }
  }

  /**
   * Adds a fanout job to the current micro-batch.
   * Automatically flushes if batch size exceeds threshold.
   */
  private async queueFanout(data: FanoutPayload): Promise<void> {
    this.batch.push(data);
    if (this.batch.length >= 100) {
      await this.flushBatch();
    }
  }

  /**
   * Flush all accumulated fanout jobs to Redis in a single pipeline.
   */
  private async flushBatch(): Promise<void> {
    if (!this.batch.length) return;

    const currentBatch = this.batch.splice(0, this.batch.length);
    const pipeline = this.redis.pipeline();
    const totalJobs = currentBatch.length;

    const feedsMap = new Map<string, { postId: string; timestamp: number }[]>();

    for (const { postId, followerIds, createdAt } of currentBatch) {
      const timestamp = createdAt ?? Date.now();
      for (const followerId of followerIds) {
        if (!feedsMap.has(followerId)) feedsMap.set(followerId, []);
        feedsMap.get(followerId)!.push({ postId, timestamp });
      }
    }

    for (const [followerId, posts] of feedsMap.entries()) {
      const key = `feed:${followerId}`;
      const zaddArgs = posts.flatMap((p) => [p.timestamp, p.postId]);
      pipeline.zadd(key, ...zaddArgs);
      pipeline.zremrangebyrank(key, 0, -(this.MAX_FEED_SIZE + 1));
    }

    const postIds = currentBatch.map((b) => b.postId);

    try {
      const execRes = await pipeline.exec();
      const failedCmds = execRes?.filter(([, err]) => err);

      if (failedCmds?.length) {
        const errorCount = failedCmds.length;
        this.logger.warn(`⚠️ Some Redis commands failed: ${errorCount}`);

        await this.prisma.feedDelivery.updateMany({
          where: { postId: { in: postIds } },
          data: {
            attempts: { increment: 1 },
            lastError: `Redis batch failed: ${errorCount} errors`,
          },
        });
        return;
      }

      await this.prisma.feedDelivery.updateMany({
        where: { postId: { in: postIds } },
        data: { delivered: true, attempts: { increment: 1 } },
      });

      this.logger.verbose(`📦 Flushed ${totalJobs} fanout jobs to Redis`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);

      await this.prisma.feedDelivery.updateMany({
        where: { postId: { in: postIds } },
        data: { attempts: { increment: 1 }, lastError: errorMsg },
      });

      this.logger.error(`❌ Redis pipeline failed: ${errorMsg}`);
    }
  }

  @Cron('0 * * * *')
  async handleCron() {
    await this.feedRepairService.repair(500);
  }
}
