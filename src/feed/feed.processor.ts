import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class FeedProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FeedProcessor.name);
  private worker: Worker;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: IORedis) {}

  onModuleInit(): void {
    this.worker = new Worker(
      'feed',
      async (
        job: Job<{ postId: string; followerIds: string[]; createdAt: number }>,
      ) => this.handleFanout(job),
      {
        connection: this.redis,
        concurrency: 10,
      },
    );

    this.logger.log('🚀 FeedProcessor ready (BullMQ worker up)');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('🛑 FeedProcessor worker closed gracefully');
    }
  }

  private async handleFanout(
    job: Job<{ postId: string; followerIds: string[]; createdAt: number }>,
  ) {
    const { postId, followerIds, createdAt } = job.data;
    const timestamp = createdAt || Date.now();
    const MAX_FEED_SIZE = 1000;

    await Promise.all(
      followerIds.map(async (followerId) => {
        const key = `feed:${followerId}`;
        await this.redis.zadd(key, timestamp, postId);
        await this.redis.zremrangebyrank(key, 0, -(MAX_FEED_SIZE + 1));
      }),
    );

    this.logger.log(
      `📡 Fanned out post ${postId} to ${followerIds.length} followers`,
    );
  }
}
