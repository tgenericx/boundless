import { Controller, Logger } from '@nestjs/common';
import { RabbitRPC, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { AuthService } from '../auth/auth.service';
import { Prisma, User } from '@boundless/types/prisma';
import { AmqpResponse, formatRpcError, RouteRegistry } from '@boundless/utils';
import { IAuthPayload } from '@boundless/types/interfaces';

const {
  registerUser,
  loginUser,
  userRegistered,
  refreshAuthToken,
  logoutUser,
} = RouteRegistry.auth;

@Controller()
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly amqp: AmqpConnection,
  ) {}

  @RabbitRPC({
    exchange: registerUser.exchange,
    routingKey: registerUser.routingKey,
    queue: registerUser.queue,
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
    exchange: loginUser.exchange,
    routingKey: loginUser.routingKey,
    queue: loginUser.queue,
    queueOptions: { durable: true },
  })
  async loginUser(data: {
    email: string;
    password: string;
  }): Promise<AmqpResponse<IAuthPayload>> {
    this.logger.log(`🔐 Received login request: ${data.email}`);

    try {
      const result = await this.authService.login(data.email, data.password);
      return { success: true, data: result };
    } catch (err) {
      this.logger.error('❌ Login failed', err);
      return formatRpcError(err, data);
    }
  }

  @RabbitRPC({
    exchange: refreshAuthToken.exchange,
    routingKey: refreshAuthToken.routingKey,
    queue: refreshAuthToken.queue,
    queueOptions: { durable: true },
  })
  async refreshToken(data: {
    token: string;
  }): Promise<AmqpResponse<IAuthPayload>> {
    this.logger.log(`🔄 Received refresh token: ${data.token}`);

    try {
      const result = await this.authService.refreshToken(data.token);
      return { success: true, data: result };
    } catch (err) {
      this.logger.error('❌ Error refreshing token', err);
      return formatRpcError(err, data);
    }
  }

  @RabbitRPC({
    exchange: logoutUser.exchange,
    routingKey: logoutUser.routingKey,
    queue: logoutUser.queue,
    queueOptions: { durable: true },
  })
  async logoutUser(data: {
    refreshToken: string;
  }): Promise<AmqpResponse<boolean>> {
    this.logger.log(`🚪 Received logout request`);
    try {
      await this.authService.logout(data.refreshToken);
      return { success: true, data: true };
    } catch (err) {
      this.logger.error('❌ Logout failed', err);
      return formatRpcError(err, data);
    }
  }
}
