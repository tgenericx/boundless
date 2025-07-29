import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Prisma, User } from '@boundless/types/prisma';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(data: Prisma.UserCreateInput): Promise<Omit<User, 'password'>> {
    const password = await argon2.hash(data.password);
    return await this.usersService.createUser({
      ...data,
      password,
    });
  }
}
