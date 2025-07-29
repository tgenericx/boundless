import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '@boundless/types/prisma';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async generateRefreshToken(userId: number): Promise<string> {
    const rawToken = randomUUID();
    const hashedToken = await argon2.hash(rawToken);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });

    return rawToken;
  }

  async rotateToken(rawToken: string, userId: number): Promise<string> {
    await this.revokeToken(rawToken);
    return this.generateRefreshToken(userId);
  }

  async revokeToken(rawToken: string): Promise<void> {
    const tokens = await this.prisma.refreshToken.findMany();

    for (const token of tokens) {
      const match = await argon2.verify(token.token, rawToken);
      if (match) {
        await this.prisma.refreshToken.delete({ where: { id: token.id } });
        return;
      }
    }

    throw new Error('Refresh token not found or already used');
  }

  async isValid(
    rawToken: string,
  ): Promise<{ valid: boolean; userId?: number }> {
    const tokens = await this.prisma.refreshToken.findMany();

    for (const token of tokens) {
      const match = await argon2.verify(token.token, rawToken);
      if (match && token.expiresAt > new Date()) {
        return { valid: true, userId: token.userId };
      }
    }

    return { valid: false };
  }
}
