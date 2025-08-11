import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Prisma, User } from '@boundless/types/prisma';
import { AuthPayload, LoginInput } from '@boundless/types/graphql';
import { RouteRegistry, TransportResponse } from '@boundless/utils';

const { registerUser, loginUser, getUserById } = RouteRegistry.auth;

@Injectable()
export class AuthService {
  constructor(private readonly amqp: AmqpConnection) {}

  async createUser(
    input: Prisma.UserCreateInput,
  ): Promise<TransportResponse<User>> {
    return await this.amqp.request<TransportResponse<User>>({
      exchange: registerUser.exchange,
      routingKey: registerUser.routingKey,
      payload: input,
    });
  }

  async login(input: LoginInput): Promise<TransportResponse<AuthPayload>> {
    return await this.amqp.request<TransportResponse<AuthPayload>>({
      exchange: loginUser.exchange,
      routingKey: loginUser.routingKey,
      payload: input,
    });
  }

  async getUserById(userId: number): Promise<TransportResponse<User>> {
    return await this.amqp.request<TransportResponse<User>>({
      exchange: getUserById.exchange,
      routingKey: getUserById.routingKey,
      payload: { userId },
    });
  }
}
