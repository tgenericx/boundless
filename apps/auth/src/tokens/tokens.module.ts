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
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const root = findMonorepoRoot(process.cwd());
        const privateKey =
          fs.readFileSync(path.join(root, 'secrets/private.pem'), 'utf8') ||
          config.get<string>('JWT_PRIVATE_KEY');
        const publicKey =
          fs.readFileSync(path.join(root, 'secrets/public.pem'), 'utf8') ||
          config.get<string>('JWT_PUBLIC_KEY');

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256',
            expiresIn: config.get<string>('ACCESS_TOKEN_EXPIRES_IN', '15m'),
          },
          verifyOptions: {
            algorithms: ['RS256'],
          },
        };
      },
    }),
  ],
  providers: [TokenService, RefreshTokenService, PrismaService],
  exports: [TokenService, RefreshTokenService],
})
export class TokensModule {}
