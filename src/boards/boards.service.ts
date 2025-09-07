import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Board } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
