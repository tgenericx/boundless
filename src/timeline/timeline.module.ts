import { Module } from '@nestjs/common';
import { TimelineResolver } from './timeline.resolver';
import { TimelineService } from './timeline.service';
import { PostsModule } from '@/posts/posts.module';
import { EventsModule } from '@/events/events.module';
import { ListingsModule } from '@/listings/listings.module';
import { InventoriesModule } from '@/inventories/inventories.module';

@Module({
  imports: [PostsModule, EventsModule, ListingsModule, InventoriesModule],
  providers: [TimelineResolver, TimelineService],
})
export class TimelineModule {}
