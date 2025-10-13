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

  const ids = await redis.zrevrange(key, start, stop);
  const total = await redis.zcard(key);

  if (!ids.length) {
    return {
      ids: [],
      pageInfo: {
        startCursor: undefined,
        endCursor: undefined,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  const startCursor = ids[0];
  const endCursor = ids.at(-1);

  const [startRank, endRank] =
    startCursor && endCursor
      ? await Promise.all([
          redis.zrevrank(key, startCursor),
          redis.zrevrank(key, endCursor),
        ])
      : [null, null];

  const hasPreviousPage = startRank !== null && startRank > 0;
  const hasNextPage = endRank !== null && endRank < total - 1;

  return {
    ids,
    pageInfo: {
      startCursor,
      endCursor,
      hasNextPage,
      hasPreviousPage,
    },
  };
}
