import { PrismaService } from '@/prisma/prisma.service';
import { BoardFollower, Prisma } from '@generated/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BoardFollowersService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(
    args: Prisma.BoardFollowerCreateArgs,
  ): Promise<BoardFollower> {
    return this.prisma.boardFollower.create(args);
  }

  async unsubscribe(
    args: Prisma.BoardFollowerDeleteArgs,
  ): Promise<BoardFollower> {
    try {
      return await this.prisma.boardFollower.delete(args);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`BoardFollower not found`);
        }
      }
      throw error;
    }
  }

  async findMany(
    args?: Prisma.BoardFollowerFindManyArgs,
  ): Promise<BoardFollower[]> {
    return this.prisma.boardFollower.findMany(args);
  }

  async findOne(
    args: Prisma.BoardFollowerFindUniqueArgs,
  ): Promise<BoardFollower> {
    const follower = await this.prisma.boardFollower.findUnique(args);
    if (!follower) {
      throw new NotFoundException(`BoardFollower not found`);
    }
    return follower;
  }
}
