import { Module } from '@nestjs/common';
import { EventsResolver } from './events.resolver';
import { EventsService } from './events.service';
import { EventPermission } from './events.permission';

@Module({
  providers: [EventsResolver, EventsService, EventPermission],
  exports: [EventsService],
})
export class EventsModule {}
