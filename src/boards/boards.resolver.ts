import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  Info,
} from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PrismaSelect } from '@paljs/plugins';
import { Prisma } from 'generated/prisma';
import { type GraphQLResolveInfo } from 'graphql';
import {
  Board,
  CreateOneBoardArgs,
  DeleteOneBoardArgs,
  FindManyBoardArgs,
  FindUniqueBoardArgs,
  UpdateOneBoardArgs,
} from '@/generated/graphql';
import { BoardsService } from './boards.service';
import { CurrentUser, OwnerOrAdminNested } from '@/utils/decorators';
import type { AuthenticatedUser } from '@/types';
import { Role } from 'generated/prisma';
import { JwtAuthGuard } from '@/utils/guards';
import { createEventPayload } from '@/types/graphql';

export const BoardEventPayload = createEventPayload('boardEvents', Board);

@Resolver(() => Board)
export class BoardsResolver {
  constructor(
    private readonly boardsService: BoardsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @OwnerOrAdminNested(
    [
      {
        resourceName: 'Board',
        serviceToken: BoardsService,
        ownerField: 'userId',
      },
    ],
    [Role.ADMIN],
  )
  @Mutation(() => Board)
  async updateBoard(@Args() args: UpdateOneBoardArgs) {
    const updated = await this.boardsService.update({
      where: args.where,
      data: args.data as unknown as Prisma.BoardUpdateInput,
    });

    await this.pubSub.publish('boardEvents', {
      boardEvents: { type: 'UPDATED', board: updated },
    });

    return updated;
  }

  @OwnerOrAdminNested(
    [
      {
        resourceName: 'Board',
        serviceToken: BoardsService,
        ownerField: 'userId',
      },
    ],
    [Role.ADMIN],
  )
  @Mutation(() => Board)
  async removeBoard(@Args() args: DeleteOneBoardArgs) {
    const removed = await this.boardsService.remove(args);

    await this.pubSub.publish('boardEvents', {
      boardEvents: { type: 'REMOVED', board: removed },
    });

    return removed;
  }

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
