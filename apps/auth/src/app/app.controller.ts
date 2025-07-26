import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Prisma, User } from '@boundless/types/prisma';
import { RabbitRPC, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { AmqpResponse, Routes } from '@boundless/types/amqp';
import { formatRpcError } from '@boundless/types/amqp';

const { userRegister, userRegistered } = Routes.auth;

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly amqp: AmqpConnection,
  ) {}

  private logger = new Logger(AppController.name);

  @RabbitRPC({
    exchange: userRegister.exchange,
    routingKey: userRegister.routingKey,
    queue: userRegister.queue,
    queueOptions: { durable: true },
  })
  async createUser(
    data: Prisma.UserCreateInput,
  ): Promise<AmqpResponse<Omit<User, 'password'>>> {
    this.logger.log('📨 Received create_user RPC via RabbitMQ:', data);

    try {
      const user = await this.appService.createUser(data);

      await this.amqp.publish(
        userRegistered.exchange,
        userRegistered.routingKey,
        user,
      );

      this.logger.log(
        `📤 Published userRegistered event for user ${user.email}`,
      );

      return { success: true, data: user };
    } catch (error) {
      this.logger.error('❌ Error creating user', error);
      return formatRpcError(error, data);
    }
  }
}
