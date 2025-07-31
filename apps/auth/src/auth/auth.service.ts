import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@boundless/types/prisma';
import * as argon2 from 'argon2';
import { AuthPayload } from '@boundless/types/graphql';
import { UsersService } from '../users/users.service';
import { TokenService } from '../tokens/token.service';
import { RefreshTokenService } from '../tokens/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async signup(data: Prisma.UserCreateInput): Promise<Omit<User, 'password'>> {
    const password = await argon2.hash(data.password);
    return await this.usersService.createUser({
      ...data,
      password,
    });
  }

  async refreshToken(token: string): Promise<AuthPayload> {
    const { valid, userId } = await this.refreshTokenService.isValid(token);

    if (!valid || !userId) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await this.usersService.findUniqueUser({
      id: userId,
    });
    if (!user) {
      throw new Error('User not found');
    }

    await this.refreshTokenService.revokeToken(token);

    const newAccessToken = this.tokenService.generateAccessToken(user);
    const newRefreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    };
  }

  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.usersService.findUniqueUser({
      email,
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeToken(refreshToken);
  }
}
