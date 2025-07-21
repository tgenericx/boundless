import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService, Prisma, User } from '@boundless/types/prisma';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async createUser(
    data: Prisma.UserCreateInput,
  ): Promise<Omit<User, 'password'>> {
    const password = await argon2.hash(data.password);
    return await this.prisma.user.create({
      data: {
        ...data,
        password,
      },
    });
  }
}
