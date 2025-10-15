import { PrismaService } from '@/prisma/prisma.service';

/**
 * Compute all feed targets (users who should see the content).
 * Includes the author themselves, their followers, and optionally
 * board followers if the content belongs to a board.
 */
export async function computeFanoutTargets(
  prisma: PrismaService,
  authorId: string,
  context?: 'post' | 'repost' | 'event' | 'board',
): Promise<string[]> {
  const followers = await prisma.userFollow.findMany({
    where: { followingId: authorId },
    select: { followerId: true },
  });

  const baseTargets = new Set([
    authorId,
    ...followers.map((f) => f.followerId),
  ]);

  if (context === 'board') {
    const boards = await prisma.board.findMany({
      where: { userId: authorId },
      select: {
        followers: {
          select: {
            userId: true,
          },
        },
      },
    });

    for (const board of boards) {
      for (const follower of board.followers) {
        baseTargets.add(follower.userId);
      }
    }
  }

  return Array.from(baseTargets);
}
