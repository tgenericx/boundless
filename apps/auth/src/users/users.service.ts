import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma, User } from '@boundless/types/prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findUniqueUser(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where,
    });
  }

  async findAllUsers(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
