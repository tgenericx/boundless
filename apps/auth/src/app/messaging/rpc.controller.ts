import { Controller, Logger } from '@nestjs/common';
import { RabbitRPC, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { AuthService } from '../auth/auth.service';
import { Prisma, User } from '@boundless/types/prisma';
import { Routes } from '@boundless/utils';
import { AmqpResponse, formatRpcError } from '@boundless/utils';

const { userRegister, userRegistered } = Routes.auth;

@Controller()
export class RpcController {
  private readonly logger = new Logger(RpcController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly amqp: AmqpConnection,
  ) {}

  @RabbitRPC({
    exchange: userRegister.exchange,
    routingKey: userRegister.routingKey,
    queue: userRegister.queue,
    queueOptions: { durable: true },
  })
  async registerUser(
    data: Prisma.UserCreateInput,
  ): Promise<AmqpResponse<Omit<User, 'password'>>> {
    this.logger.log('📨 Received RPC: registerUser', data);

    try {
      const user = await this.authService.signup(data);

      await this.amqp.publish(
        userRegistered.exchange,
        userRegistered.routingKey,
        user,
      );

      this.logger.log(`📤 Published userRegistered event: ${user.email}`);

      return { success: true, data: user };
    } catch (error) {
      this.logger.error('❌ Registration error', error);
      return formatRpcError(error, data);
    }
  }
}
