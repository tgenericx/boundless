import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);
  private readonly refreshTokenExpiresIn: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.refreshTokenExpiresIn =
      this.config.get<number>('REFRESH_TOKEN_EXPIRES_IN_DAYS', 7) *
      24 *
      60 *
      60 *
      1000;
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const rawToken = randomUUID();
    const hashedToken = await argon2.hash(rawToken);
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiresIn);

    try {
      await this.prisma.refreshToken.create({
        data: {
          userId,
          token: hashedToken,
          expiresAt,
        },
      });

      await this.cleanupExpiredTokens(userId);
      return rawToken;
    } catch (error) {
      this.logger.error(
        `Failed to generate refresh token for user ${userId}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to generate refresh token',
      );
    }
  }

  async rotateToken(rawToken: string, userId: string): Promise<string> {
    await this.revokeToken(rawToken);
    return this.generateRefreshToken(userId);
  }

  async revokeToken(rawToken: string): Promise<void> {
    try {
      const token = await this.findToken(rawToken);
      if (!token) {
        throw new NotFoundException('Refresh token not found');
      }
      await this.prisma.refreshToken.delete({ where: { id: token.id } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to revoke token', error);
      throw new InternalServerErrorException('Failed to revoke token');
    }
  }

  async isValid(
    rawToken: string,
  ): Promise<{ valid: boolean; userId?: string }> {
    try {
      const token = await this.findToken(rawToken);
      if (!token) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      return { valid: true, userId: token.userId };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return { valid: false };
      }
      this.logger.error('Token validation failed', error);
      throw new InternalServerErrorException('Token validation failed');
    }
  }

  private async findToken(rawToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { expiresAt: { gt: new Date() } },
    });

    for (const token of tokens) {
      if (await argon2.verify(token.token, rawToken)) {
        return token;
      }
    }
    return null;
  }

  private async cleanupExpiredTokens(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId,
          expiresAt: { lt: new Date() },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to cleanup expired tokens for user ${userId}`,
        error,
      );
    }
  }
}
