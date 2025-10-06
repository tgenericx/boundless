import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  Info,
} from '@nestjs/graphql';
import {
  Board,
  FindManyBoardArgs,
  FindUniqueBoardArgs,
  CreateOneBoardArgs,
  UpdateOneBoardArgs,
  DeleteOneBoardArgs,
  Role,
} from 'src/@generated/graphql';
import { BoardsService } from './boards.service';
import {
  Inject,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { BoardEventPayload } from 'src/types/graphql/board-event-payload';
import { JwtAuthGuard } from '../utils/guards';
import { CurrentUser } from '../utils/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/types/graphql';
import { PrismaSelect } from '@paljs/plugins';
import { Prisma } from '@prisma/client';
import { type GraphQLResolveInfo } from 'graphql';

@Resolver(() => Board)
export class BoardsResolver {
  constructor(
    private readonly boardsService: BoardsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Board)
  async createBoard(
    @Args() args: CreateOneBoardArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const board = await this.boardsService.create({
      ...args,
      data: {
        ...args.data,
        createdBy: { connect: { id: user.userId } },
      } as unknown as Prisma.BoardCreateInput,
    });

    await this.pubSub.publish('boardEvents', {
      boardEvents: { type: 'CREATED', board },
    });
    return board;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Board)
  async updateBoard(
    @Args() args: UpdateOneBoardArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const board = await this.boardsService.findOne({ where: args.where });
    if (!board) throw new NotFoundException('Board Not Found');

    const isOwner = board.userId === user.userId;
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not authorized to update this board');
    }

    const updated = await this.boardsService.update({
      where: args.where,
      data: args.data as unknown as Prisma.BoardUpdateInput,
    });

    await this.pubSub.publish('boardEvents', {
      boardEvents: { type: 'UPDATED', board: updated },
    });

    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Board)
  async removeBoard(
    @Args() args: DeleteOneBoardArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const board = await this.boardsService.findOne({ where: args.where });
    if (!board) throw new NotFoundException('Board Not Found');

    const isOwner = board.userId === user.userId;
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not authorized to delete this board');
    }

    const removed = await this.boardsService.remove(args);
    await this.pubSub.publish('boardEvents', {
      boardEvents: { type: 'REMOVED', board: removed },
    });
    return removed;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Board])
  async boards(
    @Args() args: FindManyBoardArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);
    if (!isAdmin)
      args.where = { ...args.where, userId: { equals: user.userId } };
    return await this.boardsService.findMany(args);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Board, { nullable: true })
  board(@Args() args: FindUniqueBoardArgs, @Info() info: GraphQLResolveInfo) {
    const prismaSelect = new PrismaSelect(info)
      .value as Prisma.BoardFindUniqueArgs;

    return this.boardsService.findOne({
      ...args,
      ...prismaSelect,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Subscription(() => BoardEventPayload, {
    name: 'boardEvents',
    description: 'Fires whenever a board is created, updated, or removed',
  })
  boardEvents() {
    return this.pubSub.asyncIterableIterator('boardEvents');
  }
}
