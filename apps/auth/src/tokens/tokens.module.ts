import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';
import { PrismaService } from '@boundless/types/prisma';
import * as path from 'path';
import * as fs from 'fs';
import { findMonorepoRoot } from '@boundless/utils';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async () => {
        const root = findMonorepoRoot(process.cwd());
        console.log('process dir:', root);
        const privateKey = fs.readFileSync(
          path.join(root, 'secrets/private.pem'),
          'utf8',
        );
        const publicKey = fs.readFileSync(
          path.join(root, 'secrets/public.pem'),
          'utf8',
        );

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256',
            expiresIn: '15m',
          },
        };
      },
    }),
  ],
  providers: [TokenService, RefreshTokenService, PrismaService],
  exports: [TokenService, RefreshTokenService],
})
export class TokensModule {}
