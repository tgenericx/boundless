import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { PrismaClient, Post, Prisma } from '@prisma/client';
import { BaseService } from '../common/base.service';
import { PubSub } from 'graphql-subscriptions';

/**
 * Service for managing Post entities.
 */
@Injectable()
export class PostsService extends BaseService<
  Post,
  Prisma.PostCreateInput,
  Prisma.PostUpdateInput
> {
  /**
   * @param prismaService - The Prisma service injected by NestJS DI
   */
  constructor(
    protected readonly prismaService: PrismaService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {
    super(prismaService);
  }

  /**
   * Provides the Prisma delegate for the Post model.
   */
  protected get delegate(): PrismaClient['post'] {
    return this.prismaService.post;
  }

  /**
   * Creates a new Post entity.
   *
   * @param data - Data used to create the Post
   * @returns A promise that resolves with the created Post
   */
  async create(data: Prisma.PostCreateInput): Promise<Post> {
    const post = await this.delegate.create({ data });
    await this.pubSub.publish('postCreated', { postCreated: post });
    return post;
  }

  /**
   * Retrieves all Post entities.
   *
   * @param args - Optional Prisma query arguments
   * @returns A promise that resolves with an array of Posts
   */
  async findAll(args: Prisma.PostFindManyArgs = {}): Promise<Post[]> {
    return await this.delegate.findMany({
      ...args,
    });
  }

  /**
   * Updates a Post entity.
   *
   * @param data - Data used to update the Post (must include `id`)
   * @returns A promise that resolves with the updated Post
   */
  update(args: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    return this.delegate.update(args);
  }
}
