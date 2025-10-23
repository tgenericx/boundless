import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library';

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

  /** Generate and persist a new refresh token for a user */
  async generateRefreshToken(userId: string): Promise<string> {
    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + this.refreshTokenTtlMs);

    try {
      await this.prisma.refreshToken.create({
        data: { userId, jti, expiresAt },
      });

      const signed = await this.refreshJwt.signAsync({
        sub: userId,
        jti,
        type: 'refresh',
      });

      // occasional cleanup of expired tokens
      if (Math.random() < 0.1)
        this.cleanupExpiredTokens(userId).catch((err) =>
          this.logger.warn('cleanupExpiredTokens failed', err),
        );

      return signed;
    } catch (error) {
      this.logger.error(`Failed to generate refresh token`, error);
      throw new InternalServerErrorException('Could not create refresh token');
    }
  }

  /** Validate a given refresh token */
  async isValid(
    providedToken: string,
  ): Promise<{ valid: boolean; userId?: string; jti?: string }> {
    try {
      const payload = await this.refreshJwt.verifyAsync<{
        sub: string;
        jti: string;
      }>(providedToken);

      if (!payload?.sub || !payload?.jti) return { valid: false };

      const tokenRow = await this.prisma.refreshToken.findUnique({
        where: { jti: payload.jti },
      });

      if (!tokenRow) return { valid: false };
      if (tokenRow.expiresAt < new Date()) return { valid: false };

      return { valid: true, userId: payload.sub, jti: payload.jti };
    } catch (error) {
      this.logger.warn('refresh JWT verify failed', error);
      return { valid: false };
    }
  }

  /** Revoke a single refresh token by its raw token value */
  async revokeToken(providedToken: string): Promise<void> {
    try {
      const payload = await this.refreshJwt.verifyAsync<{
        jti: string;
      }>(providedToken);
      if (!payload?.jti) throw new UnauthorizedException('Invalid token payload');
      await this.revokeByJti(payload.jti);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log other errors but don't rethrow, as the goal is just to revoke.
      // A valid JWT that fails revocation for other reasons is an edge case.
      this.logger.warn('Failed to revoke token', error);
    }
  }

  /** Revoke by JTI safely (idempotent) */
  private async revokeByJti(jti: string): Promise<void> {
    try {
      await this.prisma.refreshToken.delete({ where: { jti } });
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(
          `Token with jti=${jti} already deleted (idempotent revoke)`,
        );
        return;
      }

      this.logger.error('Unexpected error revoking token', error);
      throw new InternalServerErrorException('Failed to revoke token');
    }
  }

  /** Delete expired refresh tokens (background cleanup) */
  private async cleanupExpiredTokens(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { userId, expiresAt: { lt: new Date() } },
      });
    } catch (error) {
      this.logger.error(
        `Failed to cleanup expired tokens for ${userId}`,
        error,
      );
    }
  }

  /** Rotate the token — revoke old and issue a new one */
  async rotateToken(oldToken: string): Promise<string> {
    let payload: { sub: string; jti: string };
    try {
      payload = await this.refreshJwt.verifyAsync(oldToken);
    } catch (error) {
      this.logger.warn('refresh JWT verify failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!payload?.sub || !payload?.jti) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    try {
      const deletedToken = await this.prisma.refreshToken.delete({
        where: { jti: payload.jti },
      });

      if (deletedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Expired refresh token');
      }

      return this.generateRefreshToken(payload.sub);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // P2025: Record to delete not found.
        this.logger.warn(
          `Refresh token with jti=${payload.jti} not found. Possible replay attempt.`,
        );
        throw new UnauthorizedException('Invalid refresh token');
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Unexpected error rotating token', error);
      throw new InternalServerErrorException('Failed to rotate token');
    }
  }
}
