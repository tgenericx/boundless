import { Controller, Logger } from '@nestjs/common';
import { RabbitRPC, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { AuthService } from '../auth/auth.service';
import { Prisma, User } from '@boundless/types/prisma';
import { AmqpResponse, formatRpcError, RouteRegistry } from '@boundless/utils';
import { AuthPayload } from '@boundless/types/graphql';

const { userRegister, userRegistered, authToken } = RouteRegistry.auth;

@Controller()
export class AuthController {
  private logger = new Logger(AuthController.name);

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

  @RabbitRPC({
    exchange: authToken.exchange,
    routingKey: authToken.routingKey,
    queue: authToken.queue,
    queueOptions: { durable: true },
  })
  async refreshToken(data: {
    token: string;
  }): Promise<AmqpResponse<AuthPayload>> {
    this.logger.log(`🔄 Received refresh token: ${data.token}`);

    try {
      const result = await this.authService.refreshToken(data.token);
      return { success: true, data: result };
    } catch (err) {
      this.logger.error('❌ Error refreshing token', err);
      return formatRpcError(err, data);
    }
  }
}
