import { Prisma, PrismaService, User } from '@boundless/prisma-service';
import { Injectable } from '@nestjs/common';
import { Omit } from '@prisma/client/runtime/library';
import * as argon2 from 'argon2';

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
