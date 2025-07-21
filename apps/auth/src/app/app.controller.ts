import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Prisma, User } from '@boundless/types/prisma';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { AmqpResponse } from '@boundless/types/amqp';
import { formatRpcError } from '@boundless/types/amqp';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private logger = new Logger(AppController.name);

  @RabbitRPC({
    exchange: 'auth.direct',
    routingKey: 'create_user',
    queue: 'auth.create_user',
    queueOptions: { durable: true },
  })
  async createUser(
    data: Prisma.UserCreateInput,
  ): Promise<AmqpResponse<Omit<User, 'password'>>> {
    this.logger.log('📨 Received create_user RPC via RabbitMQ:', data);

    try {
      const user = await this.appService.createUser(data);
      return { success: true, data: user };
    } catch (error) {
      this.logger.error('❌ Error creating user', error);
      return formatRpcError(error, data);
    }
  }
}
