import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { TimelinePagArgs } from '@/types/graphql';

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

  async feedPosts(
    userId: string,
    args: TimelinePagArgs,
  ): Promise<{
    items: Post[];
    pageInfo: {
      startCursor: string | undefined;
      endCursor: string | undefined;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const { after, before, since, limit = 10 } = args;

    // get people you follow
    const followingIds = (
      await this.prisma.userFollow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })
    ).map((f) => f.followingId);

    // feed filter
    const where: Prisma.PostWhereInput = {
      userId: {
        in: followingIds,
      },
    };

    if (since) {
      where.createdAt = { gt: since };
    }

    const cursor = after ? { id: after } : before ? { id: before } : undefined;

    const orderBy: Prisma.PostOrderByWithRelationInput = before
      ? { createdAt: 'asc' }
      : { createdAt: 'desc' };

    const take = limit + 1;

    const posts = await this.prisma.post.findMany({
      where,
      cursor,
      skip: cursor ? 1 : 0,
      take,
      orderBy,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        postMedia: { include: { media: true } },
      },
    });

    const result = before ? posts.reverse() : posts;

    const hasNextPage = result.length > limit;
    const hasPreviousPage = !!before;

    const items = hasNextPage ? result.slice(0, limit) : result;

    return {
      items,
      pageInfo: {
        startCursor: items[0]?.id ?? null,
        endCursor: items[items.length - 1]?.id ?? null,
        hasNextPage,
        hasPreviousPage,
      },
    };
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
