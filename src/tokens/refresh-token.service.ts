import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);
  private readonly refreshTokenTtlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject('REFRESH_JWT_SERVICE') private readonly refreshJwt: JwtService,
  ) {
    const days =
      Number(this.config.get<number>('REFRESH_TOKEN_EXPIRES_IN_DAYS', 7)) || 7;
    this.refreshTokenTtlMs = days * 24 * 60 * 60 * 1000;
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + this.refreshTokenTtlMs);
    const jtiHash = await argon2.hash(jti);

    try {
      await this.prisma.refreshToken.create({
        data: { userId, jtiHash, expiresAt },
      });

      const signed = await this.refreshJwt.signAsync({
        sub: userId,
        jti,
        type: 'refresh',
      });

      if (Math.random() < 0.1)
        this.cleanupExpiredTokens(userId).catch((err) =>
          this.logger.warn('cleanupExpiredTokens failed', err),
        );

      return signed;
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

  async rotateToken(oldToken: string): Promise<string> {
    const info = await this.extractTokenInfo(oldToken);
    if (!info) throw new UnauthorizedException('Invalid refresh token');

    await this.revokeByJti(info.jti);
    return this.generateRefreshToken(info.sub);
  }

  async revokeToken(providedToken: string): Promise<void> {
    const info = await this.extractTokenInfo(providedToken);
    if (!info) throw new NotFoundException('Refresh token not found');

    await this.revokeByJti(info.jti);
  }

  async isValid(
    providedToken: string,
  ): Promise<{ valid: boolean; userId?: string }> {
    try {
      const info = await this.extractTokenInfo(providedToken);
      if (!info) return { valid: false };

      const tokenRow = await this.findRowByJti(info.jti, info.sub);
      if (!tokenRow) return { valid: false };

      return { valid: true, userId: info.sub };
    } catch (error) {
      this.logger.error('Token validation failed', error);
      return { valid: false };
    }
  }

  private async extractTokenInfo(
    token: string,
  ): Promise<{ sub: string; jti: string } | null> {
    try {
      const payload = await this.refreshJwt.verifyAsync<{
        sub: string;
        jti: string;
      }>(token);
      if (!payload?.sub || !payload?.jti) return null;
      return { sub: payload.sub, jti: payload.jti };
    } catch (err) {
      this.logger.warn('refresh JWT verify failed', err);
      return null;
    }
  }

  private async findRowByJti(jti: string, userId?: string) {
    const rows = await this.prisma.refreshToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
        ...(userId ? { userId } : {}),
      },
    });

    for (const r of rows) {
      try {
        if (r.jtiHash && (await argon2.verify(r.jtiHash, jti))) return r;
      } catch (err) {
        this.logger.warn(`argon2 verify error: ${err}`);
      }
    }
    return null;
  }

  private async revokeByJti(jti: string): Promise<void> {
    const row = await this.findRowByJti(jti);
    if (!row) throw new NotFoundException('Refresh token not found');

    try {
      await this.prisma.refreshToken.delete({ where: { id: row.id } });
    } catch (error) {
      this.logger.error('Failed to revoke token', error);
      throw new InternalServerErrorException('Failed to revoke token');
    }
  }

  private async cleanupExpiredTokens(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { userId, expiresAt: { lt: new Date() } },
      });
    } catch (error) {
      this.logger.error(
        `Failed to cleanup expired tokens for user ${userId}`,
        error,
      );
    }
  }
}
