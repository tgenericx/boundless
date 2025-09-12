import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  BoardFollower,
  FindManyBoardFollowerArgs,
  FindUniqueBoardFollowerArgs,
} from 'src/@generated/graphql';
import { BoardFollowersService } from './board-followers.service';
import {
  BadRequestException,
  Inject,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { BoardFollowerEventPayload } from 'src/types/graphql/board-follower-event-payload';
import { JwtAuthGuard } from '../utils/guards';
import { CurrentUser } from 'src/utils/decorators';
import { AuthenticatedUser } from 'src/types/graphql';

@Resolver(() => BoardFollower)
export class BoardFollowersResolver {
  constructor(
    private readonly boardFollowersService: BoardFollowersService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => BoardFollower)
  async subscribeBoard(
    @Args('boardId') boardId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BoardFollower> {
    const existing = await this.boardFollowersService.findOne({
      where: { boardId_userId: { boardId, userId: user.userId } },
    });
    if (existing) {
      throw new BadRequestException('Already subscribed to this board');
    }

    const boardFollower = await this.boardFollowersService.subscribe({
      data: {
        board: { connect: { id: boardId } },
        user: { connect: { id: user.userId } },
      },
    });

    await this.pubSub.publish('boardFollowerEvents', {
      boardFollowerEvents: { type: 'SUBSCRIBED', boardFollower },
    });
    return boardFollower;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => BoardFollower)
  async unsubscribeBoard(
    @Args('boardId') boardId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BoardFollower> {
    const boardFollower = await this.boardFollowersService.unsubscribe({
      where: { boardId_userId: { boardId, userId: user.userId } },
    });

    if (!boardFollower) {
      throw new NotFoundException('Not subscribed to this board');
    }

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
