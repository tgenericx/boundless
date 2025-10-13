import { Post } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { TimelinePagArgs } from '@/types/graphql';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: IORedis,
    @Inject('FEED_QUEUE') private readonly feedQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async fanoutPost(postId: string, followerIds: string[], createdAt: number) {
    await this.feedQueue.add('fanout', { postId, followerIds, createdAt });
    this.logger.log(`📬 Queued fan-out for post ${postId}`);
  }

  async addToFeed(userId: string, postId: string, createdAt: number) {
    const key = `feed:${userId}`;
    await this.redis.zadd(key, createdAt, postId);
  }

  private feedKey(userId: string): string {
    return `feed:${userId}`;
  }

  async fanOutPost(post: { id: string; authorId: string }): Promise<void> {
    const followers = await this.prisma.userFollow.findMany({
      where: { followingId: post.authorId },
      select: { followerId: true },
    });

    if (!followers.length) return;

    await this.feedQueue.add('fanout', {
      postId: post.id,
      followerIds: followers.map((f) => f.followerId),
      createdAt: Date.now(),
    });

    this.logger.log(`Queued fan-out for post ${post.id}`);
  }

  /**
   * Fetch paginated feed from Redis.
   * If cache is empty, fallback to DB.
   */
  async feedPosts(
    userId: string,
    args: TimelinePagArgs,
  ): Promise<{
    items: Post[];
    pageInfo: {
      startCursor?: string;
      endCursor?: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const { after, limit = 10 } = args;
    const key = this.feedKey(userId);

    let start = 0;
    if (after) {
      const rank = await this.redis.zrevrank(key, after);
      start = rank !== null ? rank + 1 : 0;
    }

    const ids = await this.redis.zrevrange(key, start, start + limit - 1);

    if (!ids.length) {
      const followingIds = (
        await this.prisma.userFollow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        })
      ).map((f) => f.followingId);

      const posts = await this.prisma.post.findMany({
        where: { userId: { in: followingIds } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          postMedia: { include: { media: true } },
        },
      });

      return {
        items: posts,
        pageInfo: {
          startCursor: posts[0]?.id,
          endCursor: posts.at(-1)?.id,
          hasNextPage: posts.length === limit,
          hasPreviousPage: false,
        },
      };
    }

    const posts = await this.prisma.post.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        postMedia: { include: { media: true } },
      },
    });

    return {
      items: posts,
      pageInfo: {
        startCursor: ids[0],
        endCursor: ids.at(-1),
        hasNextPage: (await this.redis.zcard(key)) > start + limit,
        hasPreviousPage: !!after,
      },
    };
  }
}
