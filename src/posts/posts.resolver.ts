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
} from 'src/@generated/graphql';
import { PostsService } from './posts.service';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PostEventPayload } from 'src/types/graphql/post-event-payload';
import { JwtAuthGuard } from 'src/utils/guards';
import { PrismaSelect } from '@paljs/plugins';
import { Prisma } from '@prisma/client';
import { type GraphQLResolveInfo } from 'graphql';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async createPost(@Args() args: CreateOnePostArgs) {
    const post = await this.postsService.create(args);
    await this.pubSub.publish('postEvents', {
      postEvents: { type: 'CREATED', post },
    });
    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async updatePost(@Args() args: UpdateOnePostArgs) {
    const post = await this.postsService.update(args);
    await this.pubSub.publish('postEvents', {
      postEvents: { type: 'UPDATED', post },
    });
    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Post)
  async removePost(@Args() args: DeleteOnePostArgs) {
    const post = await this.postsService.remove(args);
    await this.pubSub.publish('postEvents', {
      postEvents: { type: 'REMOVED', post },
    });
    return post;
  }

  @Query(() => [Post])
  posts(@Args() args: FindManyPostArgs) {
    return this.postsService.findMany(args);
  }

  @Query(() => Post, { nullable: true })
  post(@Args() args: FindUniquePostArgs, @Info() info: GraphQLResolveInfo) {
    const prismaSelect = new PrismaSelect(info)
      .value as Prisma.PostFindFirstArgs;
    return this.postsService.findOne({
      ...prismaSelect,
      ...args,
    });
  }

  @Subscription(() => PostEventPayload, {
    name: 'postEvents',
    description: 'Fires whenever a post is created, updated, or removed',
  })
  postEvents() {
    return this.pubSub.asyncIterableIterator('postEvents');
  }
}
