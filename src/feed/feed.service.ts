import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaService } from '@/prisma/prisma.service';
import { Post } from '@/generated/prisma';
import { TimelinePagArgs } from '@/types/graphql';
import { getFeedPage } from '@/utils/getFeed.util';
import { computeFanoutTargets, FanoutContext } from './feed.utils';
import { BoardsService } from '@/boards/boards.service';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: IORedis,
    @Inject('FEED_QUEUE') private readonly feedQueue: Queue,
    private readonly boardPermissionService: BoardsService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Trigger fan-out for a post — queues a job that distributes
   * the post to all follower feeds (including the author’s own).
   */
  async fanOutPost(
    post: { id: string; authorId: string },
    options?: { context?: FanoutContext; boardId?: string },
  ): Promise<void> {
    const { context, boardId } = options ?? {};

    if (context === 'board') {
      if (!boardId) throw new BadRequestException('boardId required');
      await this.boardPermissionService.ensureCanInteract(
        post.authorId,
        boardId,
      );
    }

    const followerIds = await computeFanoutTargets(
      this.prisma,
      post.authorId,
      options,
    );
    if (!followerIds.length) {
      this.logger.warn(`No targets for post ${post.id}`);
    }

    await this.prisma.feedDelivery.upsert({
      where: { postId: post.id },
      create: { postId: post.id },
      update: { lastError: null },
    });

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

      const targetIds = [...new Set([userId, ...followingIds])];

      const posts = await this.prisma.post.findMany({
        where: { userId: { in: targetIds } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          postMedia: true,
          _count: {
            select: {
              replies: true,
            },
          },
        },
      });

      if (posts.length) {
        const pipeline = this.redis.pipeline();
        for (const post of posts) {
          pipeline.zadd(key, post.createdAt.getTime(), post.id);
        }
        pipeline.expire(key, ttl);
        await pipeline.exec();
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
        postMedia: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    const orderedPosts = ids
      .map((id) => posts.find((p) => p.id === id))
      .filter(Boolean) as Post[];

    return { items: orderedPosts, pageInfo };
  }
}
