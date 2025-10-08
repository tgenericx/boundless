import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserFollow } from 'generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserFollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(args: Prisma.UserFollowCreateArgs): Promise<UserFollow> {
    return this.prisma.userFollow.create(args);
  }

  async unfollow(args: Prisma.UserFollowDeleteArgs): Promise<UserFollow> {
    try {
      return await this.prisma.userFollow.delete(args);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`UserFollow not found`);
        }
      }
      throw error;
    }
  }

  async findMany(args?: Prisma.UserFollowFindManyArgs): Promise<UserFollow[]> {
    return this.prisma.userFollow.findMany(args);
  }

  async findOne(args: Prisma.UserFollowFindUniqueArgs): Promise<UserFollow> {
    const follow = await this.prisma.userFollow.findUnique(args);
    if (!follow) {
      throw new NotFoundException(`UserFollow not found`);
    }
    return follow;
  }
}
