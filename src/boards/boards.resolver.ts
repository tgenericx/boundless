import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  Board,
  FindManyBoardArgs,
  FindUniqueBoardArgs,
  CreateOneBoardArgs,
  UpdateOneBoardArgs,
  DeleteOneBoardArgs,
} from 'src/@generated/graphql';
import { BoardsService } from './boards.service';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { BoardEventPayload } from 'src/types/graphql/board-event-payload';
import { JwtAuthGuard } from '../utils/guards';

@Resolver(() => Board)
export class BoardsResolver {
  constructor(
    private readonly boardsService: BoardsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Board)
  async createBoard(@Args() args: CreateOneBoardArgs) {
    const board = await this.boardsService.create(args);
    await this.pubSub.publish('boardEvents', {
      boardEvents: { type: 'CREATED', board },
    });
    return board;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Board)
  async updateBoard(@Args() args: UpdateOneBoardArgs) {
    const board = await this.boardsService.update(args);
    await this.pubSub.publish('boardEvents', {
      boardEvents: { type: 'UPDATED', board },
    });
    return board;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Board)
  async removeBoard(@Args() args: DeleteOneBoardArgs) {
    const board = await this.boardsService.remove(args);
    await this.pubSub.publish('boardEvents', {
      boardEvents: { type: 'REMOVED', board },
    });
    return board;
  }

  // queries remain public
  @Query(() => [Board])
  boards(@Args() args: FindManyBoardArgs) {
    return this.boardsService.findMany(args);
  }

  @Query(() => Board, { nullable: true })
  board(@Args() args: FindUniqueBoardArgs) {
    return this.boardsService.findOne(args);
  }

  @Subscription(() => BoardEventPayload, {
    name: 'boardEvents',
    description: 'Fires whenever a board is created, updated, or removed',
  })
  boardEvents() {
    return this.pubSub.asyncIterableIterator('boardEvents');
  }
}
