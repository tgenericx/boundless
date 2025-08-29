import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';
import * as path from 'path';
import * as fs from 'fs';
import { findRoot } from 'src/utils/find-root';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const root = findRoot(process.cwd());
        let privateKey: string | undefined;
        let publicKey: string | undefined;

        try {
          privateKey = fs.readFileSync(
            path.join(root, 'secrets/private.pem'),
            'utf8',
          );
        } catch {
          privateKey = config.get<string>('JWT_PRIVATE_KEY');
        }

        try {
          publicKey = fs.readFileSync(
            path.join(root, 'secrets/public.pem'),
            'utf8',
          );
        } catch {
          publicKey = config.get<string>('JWT_PUBLIC_KEY');
        }

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
  providers: [TokenService, RefreshTokenService],
  exports: [TokenService, RefreshTokenService, JwtModule],
})
export class TokensModule {}
