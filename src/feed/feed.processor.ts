import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class FeedProcessor implements OnModuleInit {
  private readonly logger = new Logger(FeedProcessor.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: IORedis) {}

  onModuleInit(): void {
    new Worker(
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

  private async handleFanout(
    job: Job<{ postId: string; followerIds: string[]; createdAt: number }>,
  ) {
    const { postId, followerIds, createdAt } = job.data;
    const timestamp = createdAt || Date.now();

    await Promise.all(
      followerIds.map(async (followerId) => {
        const key = `feed:${followerId}`;
        await this.redis.zadd(key, timestamp, postId);
        await this.redis.zremrangebyrank(key, 0, -1001);
      }),
    );

    this.logger.log(
      `📡 Fanned out post ${postId} to ${followerIds.length} followers`,
    );
  }
}
