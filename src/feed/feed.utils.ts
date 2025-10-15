import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export type FanoutContext = 'repost' | 'event' | 'board';

/**
 * Compute all feed targets (users who should see the content).
 * Includes the author themselves, their followers, and optionally
 * board followers if the content belongs to a board.
 */
export async function computeFanoutTargets(
  prisma: PrismaService,
  authorId: string,
  options?: { context?: FanoutContext; boardId?: string },
): Promise<string[]> {
  const { context, boardId } = options ?? {};

  const followers = await prisma.userFollow.findMany({
    where: { followingId: authorId },
    select: { followerId: true },
  });

  const targets = new Set<string>([
    authorId,
    ...followers.map((f) => f.followerId),
  ]);

  if (context === 'board') {
    if (!boardId) {
      throw new BadRequestException(
        'boardId is required when context is "board"',
      );
    }

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: {
        followers: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with id "${boardId}" not found`);
    }

    for (const follower of board.followers) {
      targets.add(follower.userId);
    }
  }

  return Array.from(targets);
}
