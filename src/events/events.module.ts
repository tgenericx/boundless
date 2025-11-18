import { Module } from '@nestjs/common';
import { EventsResolver } from './events.resolver';
import { EventsService } from './events.service';
import { EventPermission } from './events.permission';
import { EventRepository } from './events.repository';

@Module({
  providers: [EventsResolver, EventsService, EventPermission, EventRepository],
  exports: [EventsService],
})
export class EventsModule {}
