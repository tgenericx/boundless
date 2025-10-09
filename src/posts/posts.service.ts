import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, Prisma } from 'generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.PostCreateArgs): Promise<Post> {
    return this.prisma.post.create(args);
  }

  async findOne(args: Prisma.PostFindUniqueArgs): Promise<Post> {
    const post = await this.prisma.post.findUnique(args);

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    return post;
  }

  async feedPosts(args: {
    userId: string;
    after?: string;
    before?: string;
    since?: Date;
    limit?: number;
  }): Promise<Post[]> {
    const { userId, after, before, since, limit = 10 } = args;

    const followingIds = (
      await this.prisma.userFollow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })
    ).map((f) => f.followingId);

    const where: Prisma.PostWhereInput = {
      userId: { in: followingIds.length ? followingIds : ['_'] },
    };

    if (since) {
      // fetch only newer posts than `since`
      where.createdAt = { gt: since };
    }

    const cursor = after ? { id: after } : before ? { id: before } : undefined;

    const orderBy: Prisma.PostOrderByWithRelationInput = before
      ? { createdAt: 'asc' }
      : { createdAt: 'desc' };

    const posts = await this.prisma.post.findMany({
      where,
      cursor,
      skip: cursor ? 1 : 0,
      take: limit,
      orderBy,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        postMedia: { include: { media: true } },
      },
    });

    const result = before ? posts.reverse() : posts;

    return result;
  }

  async update(args: Prisma.PostUpdateArgs): Promise<Post> {
    try {
      return await this.prisma.post.update(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Post not found`);
      }
      throw error;
    }
  }

  async remove(args: Prisma.PostDeleteArgs): Promise<Post> {
    try {
      return await this.prisma.post.delete(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Post not found`);
      }
      throw error;
    }
  }

  async findMany(args?: Prisma.PostFindManyArgs): Promise<Post[]> {
    return this.prisma.post.findMany(args);
  }
}
