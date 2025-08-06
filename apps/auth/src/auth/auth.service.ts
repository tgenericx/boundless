import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, User } from '@boundless/types/prisma';
import * as argon2 from 'argon2';
import { AuthPayload } from '@boundless/types/graphql';
import { UsersService } from '../users/users.service';
import { TokenService } from '../tokens/token.service';
import { RefreshTokenService } from '../tokens/refresh-token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async signup(data: Prisma.UserCreateInput): Promise<Omit<User, 'password'>> {
    try {
      const existingUser = await this.usersService.findUniqueUser({
        email: data.email,
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const password = await argon2.hash(data.password);
      return await this.usersService.createUser({
        ...data,
        password,
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error('Signup failed', error);
      throw new InternalServerErrorException('Signup failed');
    }
  }

  async refreshToken(token: string): Promise<AuthPayload> {
    try {
      const { valid, userId } = await this.refreshTokenService.isValid(token);

      if (!valid || !userId) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.usersService.findUniqueUser({ id: userId });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.refreshTokenService.revokeToken(token);

      const newAccessToken = this.tokenService.generateAccessToken(user);
      const newRefreshToken =
        await this.refreshTokenService.generateRefreshToken(user.id);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error('Refresh token failed', error);
      throw new InternalServerErrorException('Refresh token failed');
    }
  }

  async login(email: string, password: string): Promise<AuthPayload> {
    try {
      const user = await this.usersService.findUniqueUser({ email });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const valid = await argon2.verify(user.password, password);
      if (!valid) {
        throw new UnauthorizedException('Invalid credentials');
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
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Login failed', error);
      throw new InternalServerErrorException('Login failed');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await this.refreshTokenService.revokeToken(refreshToken);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      this.logger.error('Logout failed', error);
      throw new InternalServerErrorException('Logout failed');
    }
  }

  async getUserById(userId: User['id']): Promise<User> {
    try {
      const user = await this.usersService.findUniqueUser({ id: userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error('Failed to retrieve user by ID', error);
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }
}
