import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Post, Prisma } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { CreatePostInput } from './dto/create-post.input';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  async create(data: CreatePostInput): Promise<Post> {
    const post = await this.prisma.post.create({
      data: {
        textContent: data.textContent,
        mediaUrls: data.mediaUrls ?? [],
      },
    });

    await this.pubSub.publish('postCreated', { postCreated: post });
    this.logger.log(`Created post with ID: ${post.id}`);
    return post;
  }

  async findAll(args: Prisma.PostFindManyArgs = {}): Promise<{
    data: Post[];
    nextCursor: string | null;
  }> {
    const { cursor, take = 10, skip = 0, ...rest } = args;

    const posts = await this.prisma.post.findMany({
      take: take + 1,
      skip,
      cursor,
      orderBy: {
        createdAt: 'desc',
      },
      ...rest,
    });

    const data = posts.slice(0, take);
    const next = posts.length > take ? posts[take] : null;

    return {
      data,
      nextCursor: next ? next.id : null,
    };
  }

  async findUnique(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where });
    if (!post) {
      throw new NotFoundException(`Post not found`);
    }
    return post;
  }

  async update(args: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    return this.prisma.post.update(args);
  }

  async delete(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({ where });
  }
}
