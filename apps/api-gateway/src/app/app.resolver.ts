import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { User, UserCreateInput } from '@boundless/types/graphql';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Logger } from '@nestjs/common';
import { RouteRegistry } from '@boundless/utils';
import {
  AmqpResponse,
  GraphQLResponseHelper,
  isAmqpSuccess,
} from '@boundless/utils';

const { registerUser } = RouteRegistry.auth;

@Resolver()
export class AppResolver {
  private readonly logger = new Logger(AppResolver.name);

  constructor(private readonly amqp: AmqpConnection) {}

  @Query(() => String)
  root(): string {
    return 'Root query to satisfy GraphQL schema requirements';
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') input: UserCreateInput,
  ): Promise<User> {
    this.logger.log('📤 Sending create_user message via AmqpConnection');

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
}
