import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { User, UserCreateInput } from '@boundless/types/graphql';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Logger } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { AmqpResponse, isAmqpSuccess } from '@boundless/types/amqp';

@Resolver()
export class AppResolver {
  constructor(private readonly amqp: AmqpConnection) {}
  private readonly logger = new Logger(AppResolver.name);

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
      exchange: 'auth.direct',
      routingKey: 'create_user',
      payload: input,
    });

    if (isAmqpSuccess(response)) {
      return response.data;
    }

    this.logger.error('❌ createUser RPC failed:', response.error);

    throw new GraphQLError(
      typeof response.error.message === 'string'
        ? response.error.message
        : 'Unknown error',
      {
        extensions: {
          code:
            typeof response.error.code === 'string'
              ? response.error.code
              : 'INTERNAL_SERVER_ERROR',
          metadata: response.error.meta,
        },
      },
    );
  }
}
