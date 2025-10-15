import { PrismaService } from '@/prisma/prisma.service';
import { Board, Prisma } from '@/generated/prisma';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ------------------------------------------------------------------
   * 🏗️ Core CRUD operations
   * ------------------------------------------------------------------ */

  async create(args: Prisma.BoardCreateArgs): Promise<Board> {
    return this.prisma.board.create(args);
  }

  async findOne(args: Prisma.BoardFindUniqueArgs): Promise<Board | null> {
    return await this.prisma.board.findUnique(args);
  }

  async findMany(args?: Prisma.BoardFindManyArgs): Promise<Board[]> {
    return this.prisma.board.findMany(args);
  }

  async update(args: Prisma.BoardUpdateArgs): Promise<Board> {
    try {
      return await this.prisma.board.update(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Board not found');
      }
      throw error;
    }
  }

  async remove(args: Prisma.BoardDeleteArgs): Promise<Board> {
    try {
      return await this.prisma.board.delete(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Board not found');
      }
      throw error;
    }
  }

  /* ------------------------------------------------------------------
   * 🛡️ Permission checks
   * ------------------------------------------------------------------ */

  /**
   * Ensures a user can interact with a board (post/comment/react/etc.)
   * Throws if not allowed.
   */
  async ensureCanInteract(userId: string, boardId: string): Promise<void> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: {
        id: true,
        userId: true,
        followers: { select: { userId: true } },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with id "${boardId}" not found`);
    }

    const isOwner = board.userId === userId;
    const isFollower = board.followers.some((f) => f.userId === userId);

    if (!isOwner && !isFollower) {
      throw new ForbiddenException(
        'You must be a follower of this board to interact with it.',
      );
    }
  }

  /**
   * Silent boolean check
   */
  async canInteract(userId: string, boardId: string): Promise<boolean> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: {
        userId: true,
        followers: { select: { userId: true } },
      },
    });

    if (!board) return false;

    return (
      board.userId === userId ||
      board.followers.some((f) => f.userId === userId)
    );
  }
}
