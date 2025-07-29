import { Module } from '@nestjs/common';
import { RpcController } from './rpc.controller';
import { AuthModule } from '../auth/auth.module';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [AuthModule],
  controllers: [RpcController],
  providers: [AmqpConnection],
})
export class MessagingModule {}
