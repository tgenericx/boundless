import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  UserFollow,
  FindManyUserFollowArgs,
  FindUniqueUserFollowArgs,
  CreateOneUserFollowArgs,
  DeleteOneUserFollowArgs,
} from 'src/@generated/graphql';
import { UserFollowsService } from './user-follows.service';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { UserFollowEventPayload } from 'src/types/graphql/user-follow-event-payload';
import { JwtAuthGuard } from 'src/utils/guards';

@Resolver(() => UserFollow)
export class UserFollowsResolver {
  constructor(
    private readonly userFollowsService: UserFollowsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserFollow)
  async followUser(@Args() args: CreateOneUserFollowArgs) {
    const userFollow = await this.userFollowsService.follow(args);
    await this.pubSub.publish('userFollowEvents', {
      userFollowEvents: { type: 'FOLLOWED', userFollow },
    });
    return userFollow;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserFollow)
  async unfollowUser(@Args() args: DeleteOneUserFollowArgs) {
    const userFollow = await this.userFollowsService.unfollow(args);
    await this.pubSub.publish('userFollowEvents', {
      userFollowEvents: { type: 'UNFOLLOWED', userFollow },
    });
    return userFollow;
  }

  @Query(() => [UserFollow])
  userFollows(@Args() args: FindManyUserFollowArgs) {
    return this.userFollowsService.findMany(args);
  }

  @Query(() => UserFollow, { nullable: true })
  userFollow(@Args() args: FindUniqueUserFollowArgs) {
    return this.userFollowsService.findOne(args);
  }

  @Subscription(() => UserFollowEventPayload, {
    name: 'userFollowEvents',
    description: 'Fires when a user follows or unfollows another user',
  })
  userFollowEvents() {
    return this.pubSub.asyncIterableIterator('userFollowEvents');
  }
}
