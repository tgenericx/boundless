import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy, RefreshJwtStrategy } from '../utils/strategies';
import { JwtAuthGuard, RefreshJwtGuard } from '../utils/guards';
import { UsersService } from 'src/users/users.service';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  imports: [PassportModule, TokensModule, MailerModule],
  providers: [
    AuthResolver,
    AuthService,
    UsersService,
    JwtStrategy,
    RefreshJwtStrategy,
    JwtAuthGuard,
    RefreshJwtGuard,
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
