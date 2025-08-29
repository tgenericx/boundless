import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../utils/strategies';
import { GqlAuthGuard } from '../utils/guards';
import { UsersService } from 'src/users/users.service';
import { TokenService } from 'src/tokens/token.service';
import { RefreshTokenService } from 'src/tokens/refresh-token.service';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  imports: [PassportModule, TokensModule],
  providers: [
    AuthResolver,
    AuthService,
    UsersService,
    TokenService,
    RefreshTokenService,
    JwtStrategy,
    GqlAuthGuard,
  ],
  exports: [GqlAuthGuard],
})
export class AuthModule {}
