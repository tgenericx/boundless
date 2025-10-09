import { Resolver, Query, Args } from '@nestjs/graphql';
import { TimelineService } from './timeline.service';
import { CurrentUser } from '@/utils/decorators';
import { type AuthenticatedUser } from '@/types';
import { TimelineConnection } from './entities/timeline.model';
import { TimelinePaginationArgs } from './dto/timeline-pagination.args';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/utils/guards';

@Resolver()
export class TimelineResolver {
  constructor(private readonly timelineService: TimelineService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => TimelineConnection)
  async timelineFeed(
    @CurrentUser() user: AuthenticatedUser,
    @Args() args: TimelinePaginationArgs,
  ) {
    return this.timelineService.getTimelineFeed(user.userId, args);
  }
}
