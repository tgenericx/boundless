import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';

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

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

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

    const pipeline = this.redis.pipeline();
    const totalJobs = this.batch.length;

    for (const { postId, followerIds, createdAt } of this.batch) {
      const timestamp = createdAt ?? Date.now();

      for (const followerId of followerIds) {
        const key = `feed:${followerId}`;
        pipeline.zadd(key, timestamp, postId);
        pipeline.zremrangebyrank(key, 0, -(this.MAX_FEED_SIZE + 1));
      }
    }

    try {
      await pipeline.exec();
      this.logger.verbose(`📦 Flushed ${totalJobs} fanout jobs to Redis`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(
          `❌ Redis pipeline failed: ${err.message}`,
          err.stack,
        );
      } else {
        this.logger.error(`❌ Redis pipeline failed: ${JSON.stringify(err)}`);
      }
    } finally {
      this.batch = [];
    }
  }
}
