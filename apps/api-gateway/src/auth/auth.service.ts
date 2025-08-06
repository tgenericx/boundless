import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  AuthPayload,
  User,
  LoginInput,
  UserCreateInput,
} from '@boundless/types/graphql';
import {
  AmqpResponse,
  GraphQLResponseHelper,
  isAmqpSuccess,
  RouteRegistry,
} from '@boundless/utils';

const { registerUser, loginUser, getUserById } = RouteRegistry.auth;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly amqp: AmqpConnection) {}

  async createUser(input: UserCreateInput): Promise<User> {
    const response = await this.amqp.request<AmqpResponse<User>>({
      exchange: registerUser.exchange,
      routingKey: registerUser.routingKey,
      payload: input,
    });

    if (!isAmqpSuccess(response)) {
      this.logger.error('❌ createUser RPC failed:', response.error);
    }

    return GraphQLResponseHelper.fromAmqpResponse(response);
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const response = await this.amqp.request<AmqpResponse<AuthPayload>>({
      exchange: loginUser.exchange,
      routingKey: loginUser.routingKey,
      payload: input,
    });

    if (!isAmqpSuccess(response)) {
      this.logger.error('❌ login RPC failed:', response.error);
    }

    return GraphQLResponseHelper.fromAmqpResponse(response);
  }

  async getUserById(userId: number): Promise<User> {
    const response = await this.amqp.request<AmqpResponse<User>>({
      exchange: getUserById.exchange,
      routingKey: getUserById.routingKey,
      payload: { userId },
    });

    if (!isAmqpSuccess(response)) {
      this.logger.error('❌ getUserById RPC failed:', response.error);
      throw new Error('Failed to retrieve user');
    }

    return GraphQLResponseHelper.fromAmqpResponse(response);
  }
}
