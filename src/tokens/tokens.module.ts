import { Module, Global } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';
import { accessJwtConfigFactory } from './jwt/access-jwt.config';
import { refreshJwtConfigFactory } from './jwt/refresh-jwt.config';

@Global()
@Module({
  imports: [ConfigModule, JwtModule.register({})],
  providers: [
    {
      provide: 'ACCESS_JWT_SERVICE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new JwtService(accessJwtConfigFactory(config)),
    },
    {
      provide: 'REFRESH_JWT_SERVICE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new JwtService(refreshJwtConfigFactory(config)),
    },
    TokenService,
    RefreshTokenService,
  ],
  exports: [
    JwtModule,
    'ACCESS_JWT_SERVICE',
    'REFRESH_JWT_SERVICE',
    TokenService,
    RefreshTokenService,
  ],
})
export class TokensModule {}
