import { Redis } from 'ioredis';

export interface FeedPageArgs {
  redis: Redis;
  key: string;
  limit: number;
  after?: string;
  before?: string;
}

export interface FeedPageResult {
  ids: string[];
  pageInfo: {
    startCursor?: string;
    endCursor?: string;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Handles cursor-based pagination for timeline-like feeds stored in Redis sorted sets.
 * Always returns items in DESC order (newest → oldest), regardless of direction.
 */
export async function getFeedPage({
  redis,
  key,
  limit,
  after,
  before,
}: FeedPageArgs): Promise<FeedPageResult> {
  let start = 0;
  let stop = limit - 1;

  if (after) {
    const rank = await redis.zrevrank(key, after);
    start = rank !== null ? rank + 1 : 0;
    stop = start + limit - 1;
  } else if (before) {
    const rank = await redis.zrevrank(key, before);
    if (rank !== null) {
      stop = rank - 1;
      start = Math.max(stop - limit + 1, 0);
    }
  }

  let ids = await redis.zrevrange(key, start, stop);

  if (before) {
    ids = ids.reverse();
  }

  const total = await redis.zcard(key);

  return {
    ids,
    pageInfo: {
      startCursor: ids[0],
      endCursor: ids.at(-1),
      hasNextPage: stop < total - 1,
      hasPreviousPage: start > 0,
    },
  };
}
