import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';
import { PrismaService } from '@boundless/types/prisma';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'super-secret-key'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [TokenService, RefreshTokenService, PrismaService],
  exports: [TokenService, RefreshTokenService],
})
export class TokensModule {}
