import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  UserFollow,
  FindManyUserFollowArgs,
  FindUniqueUserFollowArgs,
  CreateOneUserFollowArgs,
  DeleteOneUserFollowArgs,
} from 'src/@generated/graphql';
import { UserFollowsService } from './user-follows.service';
import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { UserFollowEventPayload } from 'src/types/graphql/user-follow-event-payload';
import { JwtAuthGuard } from 'src/utils/guards';
import { CurrentUser } from 'src/utils/decorators';
import { AuthenticatedUser } from 'src/types/graphql';
import { Prisma } from '@prisma/client';

@Resolver(() => UserFollow)
export class UserFollowsResolver {
  constructor(
    private readonly userFollowsService: UserFollowsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserFollow)
  async followUser(
    @Args() args: CreateOneUserFollowArgs,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserFollow> {
    const pArgs = args as Prisma.UserFollowCreateArgs;
    const { followerId } = pArgs.data;
    const id = pArgs.data.following?.connect?.id;

    if (id === user.userId || followerId === user.userId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const userFollow = await this.userFollowsService.follow({
      ...args,
      data: {
        ...args.data,
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
