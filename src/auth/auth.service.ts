import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { TokenService } from '../tokens/token.service';
import { RefreshTokenService } from '../tokens/refresh-token.service';
import { Prisma, Role, User } from '@prisma/client';
import { IAuthPayload } from 'src/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async signup(input: Prisma.UserCreateArgs): Promise<User> {
    let roles: Role[] = [];

    if (Array.isArray(input.data.roles)) {
      roles = input.data.roles;
    } else if (input.data.roles && 'set' in input.data.roles) {
      roles = input.data.roles.set;
    }

    if (roles.includes(Role.ADMIN)) {
      throw new BadRequestException('You cannot assign yourself an ADMIN role');
    }

    const existingUser = await this.usersService.findOne({
      where: { email: input.data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const password = await argon2.hash(input.data.password);

    return this.usersService.create({
      ...input,
      data: {
        ...input.data,
        password,
      },
    });
  }

  async refreshToken(token: string): Promise<IAuthPayload> {
    const { valid, userId } = await this.refreshTokenService.isValid(token);

    if (!valid || !userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
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

  async login(email: string, password: string): Promise<IAuthPayload> {
    const user = await this.usersService.findOne({
      where: {
        email: email,
      },
    });

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
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeToken(refreshToken);
  }
}
