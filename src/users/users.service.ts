import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: Prisma.UserCreateArgs): Promise<User> {
    return await this.prisma.user.create(input);
  }

  async findOne(args: Prisma.UserFindUniqueArgs): Promise<User | null> {
    return await this.prisma.user.findUnique(args);
  }

  async update(args: Prisma.UserUpdateArgs): Promise<User> {
    try {
      return await this.prisma.user.update(args);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User not found`);
        }
      }
      throw error;
    }
  }

  async remove(args: Prisma.UserFindUniqueArgs): Promise<User> {
    try {
      return await this.prisma.user.delete(args);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User not found`);
        }
      }
      throw error;
    }
  }

  async findMany(args?: Prisma.UserFindManyArgs): Promise<User[]> {
    return await this.prisma.user.findMany(args);
  }
}
