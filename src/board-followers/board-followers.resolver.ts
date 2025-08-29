import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  BoardFollower,
  FindManyBoardFollowerArgs,
  FindUniqueBoardFollowerArgs,
  CreateOneBoardFollowerArgs,
  DeleteOneBoardFollowerArgs,
} from 'src/@generated/graphql';
import { BoardFollowersService } from './board-followers.service';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { BoardFollowerEventPayload } from 'src/types/graphql/board-follower-event-payload';
import { JwtAuthGuard } from '../utils/guards';

@Resolver(() => BoardFollower)
export class BoardFollowersResolver {
  constructor(
    private readonly boardFollowersService: BoardFollowersService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => BoardFollower)
  async subscribeBoard(@Args() args: CreateOneBoardFollowerArgs) {
    const boardFollower = await this.boardFollowersService.subscribe(args);
    await this.pubSub.publish('boardFollowerEvents', {
      boardFollowerEvents: { type: 'SUBSCRIBED', boardFollower },
    });
    return boardFollower;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => BoardFollower)
  async unsubscribeBoard(@Args() args: DeleteOneBoardFollowerArgs) {
    const boardFollower = await this.boardFollowersService.unsubscribe(args);
    await this.pubSub.publish('boardFollowerEvents', {
      boardFollowerEvents: { type: 'UNSUBSCRIBED', boardFollower },
    });
    return boardFollower;
  }

  @Query(() => [BoardFollower])
  boardFollowers(@Args() args: FindManyBoardFollowerArgs) {
    return this.boardFollowersService.findMany(args);
  }

  @Query(() => BoardFollower, { nullable: true })
  boardFollower(@Args() args: FindUniqueBoardFollowerArgs) {
    return this.boardFollowersService.findOne(args);
  }

  @Subscription(() => BoardFollowerEventPayload, {
    name: 'boardFollowerEvents',
    description: 'Fires when a user subscribes or unsubscribes to a board',
  })
  boardFollowerEvents() {
    return this.pubSub.asyncIterableIterator('boardFollowerEvents');
  }
}
