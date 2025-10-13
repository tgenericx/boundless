import { Args, Query, Resolver } from '@nestjs/graphql';
import { FeedService } from './feed.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/utils/guards';
import { TimelinePagArgs, TimelinePosts } from '@/types/graphql';
import { type AuthenticatedUser } from '@/types';
import { CurrentUser } from '@/utils/decorators';

@Resolver()
export class FeedResolver {
  constructor(private readonly feeds: FeedService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => TimelinePosts)
  async feedPosts(
    @Args() args: TimelinePagArgs,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TimelinePosts> {
    return this.feeds.feedPosts(user.userId, args);
  }
}
