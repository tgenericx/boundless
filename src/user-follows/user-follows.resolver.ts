import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  UserFollow,
  FindManyUserFollowArgs,
  FindUniqueUserFollowArgs,
} from '@/generated/graphql';
import { UserFollowsService } from './user-follows.service';
import {
  BadRequestException,
  Inject,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { UserFollowEventPayload } from '@/types/graphql/user-follow-event-payload';
import { JwtAuthGuard } from '@/utils/guards';
import { CurrentUser } from '@/utils/decorators';
import { type AuthenticatedUser } from '@/types';

@Resolver(() => UserFollow)
export class UserFollowsResolver {
  constructor(
    private readonly userFollowsService: UserFollowsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserFollow)
  async followUser(
    @Args('followingId') followingId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserFollow> {
    if (followingId === user.userId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const userFollow = await this.userFollowsService.follow({
      data: {
        following: {
          connect: {
            id: followingId,
          },
        },
        follower: {
          connect: {
            id: user.userId,
          },
        },
      },
    });

    await this.pubSub.publish('userFollowEvents', {
      userFollowEvents: { type: 'FOLLOWED', userFollow },
    });
    return userFollow;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserFollow)
  async unfollowUser(
    @Args('followingId') followingId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserFollow> {
    const userFollow = await this.userFollowsService.unfollow({
      where: {
        followerId_followingId: {
          followerId: user.userId,
          followingId,
        },
      },
    });

    if (!userFollow) {
      throw new NotFoundException('Follow relationship not found');
    }

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
