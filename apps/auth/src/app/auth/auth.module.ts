import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { TokensModule } from '../tokens/tokens.module';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [UsersModule, TokensModule],
  providers: [AuthService, AmqpConnection],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
