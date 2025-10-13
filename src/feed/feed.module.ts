import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FeedService } from './feed.service';
import { FeedResolver } from './feed.resolver';
import { FeedProcessor } from './feed.processor';
import IORedis from 'ioredis';
import { FeedQueueMonitor } from './feed.monitor';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: ['REDIS_CLIENT'],
      useFactory: (redis: IORedis) => ({
        connection: redis,
      }),
    }),
  ],
  providers: [FeedService, FeedResolver, FeedProcessor, FeedQueueMonitor],
  exports: [FeedService],
})
export class FeedModule {}
