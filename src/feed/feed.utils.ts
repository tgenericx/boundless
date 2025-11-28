import { PrismaService } from '@/prisma/prisma.service';

export type FanoutContext = 'repost' | 'event' | 'board';

/**
 * Compute all feed targets (users who should see the content).
 * Includes the author themselves, their followers, and optionally
 * board followers if the content belongs to a board.
 */
export async function computeFanoutTargets(
  prisma: PrismaService,
  authorId: string,
): Promise<string[]> {
  const followers = await prisma.userFollow.findMany({
    where: { followingId: authorId },
    select: { followerId: true },
  });

  const targets = new Set<string>([
    authorId,
    ...followers.map((f) => f.followerId),
  ]);

  return Array.from(targets);
}
