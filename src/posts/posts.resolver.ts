import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  Info,
} from '@nestjs/graphql';
import {
  Post,
  FindManyPostArgs,
  FindUniquePostArgs,
  CreateOnePostArgs,
  UpdateOnePostArgs,
  DeleteOnePostArgs,
  Role,
} from '@/generated/graphql';
import { PostsService } from './posts.service';
import {
  Inject,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard } from 'src/utils/guards';
import { Prisma } from 'generated/prisma';
import { PrismaSelect } from '@paljs/plugins';
import { type GraphQLResolveInfo } from 'graphql';
import { CurrentUser } from '@/utils/decorators';
import { type AuthenticatedUser } from '@/types';
import { createEventPayload } from '@/types/graphql';

export const PostEventPayload = createEventPayload('postEvents', Post);

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  /**
   * Create Post — associates createdBy with the current user.
   */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async createPost(
    @Args() args: CreateOnePostArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const post = await this.postsService.create({
      data: {
        ...args.data,
        createdBy: {
          connect: { id: user.userId },
        },
      } as unknown as Prisma.PostCreateInput,
    });

    await this.pubSub.publish('postEvents', {
      postEvents: { type: 'CREATED', post },
    });
    return post;
  }

  /**
   * Update Post — only the owner or admin can update.
   */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async updatePost(
    @Args() args: UpdateOnePostArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.postsService.findOne({ where: args.where });
    if (!existing) throw new NotFoundException('Post not found');

    const isOwner = existing.userId === user.userId;
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not authorized to update this post');
    }

    const updated = await this.postsService.update({
      where: args.where,
      data: args.data as unknown as Prisma.PostUpdateInput,
    });

    await this.pubSub.publish('postEvents', {
      postEvents: { type: 'UPDATED', post: updated },
    });
    return updated;
  }

  /**
   * Delete Post — only the owner or admin can delete.
   */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async removePost(
    @Args() args: DeleteOnePostArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.postsService.findOne({ where: args.where });
    if (!existing) throw new NotFoundException('Post not found');

    const isOwner = existing.userId === user.userId;
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not authorized to delete this post');
    }

    const removed = await this.postsService.remove(args);

    await this.pubSub.publish('postEvents', {
      postEvents: { type: 'REMOVED', post: removed },
    });
    return removed;
  }

  /**
   * Query Posts — non-admins only see their own.
   */
  @UseGuards(JwtAuthGuard)
  @Query(() => [Post])
  async posts(
    @Args() args: FindManyPostArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);

    if (!isAdmin) {
      args.where = { ...args.where, userId: { equals: user.userId } };
    }

    return this.postsService.findMany(args);
  }

  /**
   * Query Single Post
   */
  @Query(() => Post, { nullable: true })
  post(@Args() args: FindUniquePostArgs, @Info() info: GraphQLResolveInfo) {
    const prismaSelect = new PrismaSelect(info)
      .value as Prisma.PostFindUniqueArgs;
    return this.postsService.findOne({
      ...args,
      ...prismaSelect,
    });
  }

  /**
   * Post Subscriptions
   */
  @Subscription(() => PostEventPayload, {
    name: 'postEvents',
    description: 'Fires whenever a post is created, updated, or removed',
  })
  postEvents() {
    return this.pubSub.asyncIterableIterator('postEvents');
  }
}
