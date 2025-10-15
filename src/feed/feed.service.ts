import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaService } from '@/prisma/prisma.service';
import { Post } from '@/generated/prisma';
import { TimelinePagArgs } from '@/types/graphql';
import { getFeedPage } from '@/utils/getFeed.util';
import { computeFanoutTargets } from './feed.utils';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: IORedis,
    @Inject('FEED_QUEUE') private readonly feedQueue: Queue,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Trigger fan-out for a post — queues a job that distributes
   * the post to all follower feeds (including the author’s own).
   */
  async fanOutPost(post: { id: string; authorId: string }): Promise<void> {
    const followerIds = await computeFanoutTargets(this.prisma, post.authorId);

    if (!followerIds.length) {
      this.logger.warn(`No followers found for author ${post.authorId}`);
      return;
    }

    await this.feedQueue.add('fanout', {
      postId: post.id,
      followerIds,
      createdAt: Date.now(),
    });

    this.logger.log(
      `📬 Queued fan-out for post ${post.id} to ${followerIds.length} feeds`,
    );
  }

  /**
   * Add a post directly to a single user's feed.
   */
  async addToFeed(userId: string, postId: string, createdAt: number) {
    const key = this.feedKey(userId);
    await this.redis.zadd(key, createdAt, postId);
  }

  private feedKey(userId: string): string {
    return `feed:${userId}`;
  }

  /**
   * Fetch paginated feed items from Redis (with DB fallback).
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
    const { after, before, limit = 10 } = args;
    const key = this.feedKey(userId);
    const ttl = this.config.get<number>('FEED_CACHE_TTL', 60 * 10);

    const { ids, pageInfo } = await getFeedPage({
      redis: this.redis,
      key,
      limit,
      after,
      before,
    });

    if (!ids.length) {
      this.logger.verbose(`Cache miss for user:${userId}, fetching from DB...`);

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

      if (posts.length) {
        const pipeline = this.redis.pipeline();
        for (const post of posts) {
          pipeline.zadd(key, post.createdAt.getTime(), post.id);
        }
        pipeline.expire(key, ttl);
        await pipeline.exec();

        this.logger.debug(
          `🧠 Cached ${posts.length} posts for user:${userId} (TTL ${ttl}s)`,
        );
      }

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

    this.logger.verbose(`Cache hit for user:${userId} with ${ids.length} IDs`);
    const posts = await this.prisma.post.findMany({
      where: { id: { in: ids } },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        postMedia: { include: { media: true } },
      },
    });

    const orderedPosts = ids
      .map((id) => posts.find((p) => p.id === id))
      .filter(Boolean) as Post[];

    return { items: orderedPosts, pageInfo };
  }
}
