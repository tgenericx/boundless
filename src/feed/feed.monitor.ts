import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueEvents } from 'bullmq';

@Injectable()
export class FeedQueueMonitor implements OnModuleInit {
  private readonly logger = new Logger(FeedQueueMonitor.name);

  constructor(
    @Inject('FEED_QUEUE_EVENTS') private readonly events: QueueEvents,
  ) {}

  onModuleInit(): void {
    this.events.on('completed', ({ jobId }) =>
      this.logger.log(`✅ Job ${jobId} completed`),
    );
    this.events.on('failed', ({ jobId, failedReason }) =>
      this.logger.error(`❌ Job ${jobId} failed: ${failedReason}`),
    );
    this.logger.log('📊 Feed queue event listener started');
  }
}
