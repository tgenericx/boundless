import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { User, UserCreateInput } from '@boundless/types/graphql';
import { GraphQLErrorHelper } from '@boundless/errors';

@Resolver()
export class AppResolver {
  private readonly logger = new Logger(AppResolver.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    console.log('🧠 AppResolver initialized');
    this.authClient
      .connect()
      .then(() => {
        console.log('🔗 Manually connected to AUTH_SERVICE RMQ');
      })
      .catch((e) => {
        console.error('❌ RMQ ClientProxy connection failed:', e);
      });
  }

  @Query(() => String)
  root(): string {
    return 'Root query to satisfy GraphQL schema requirements';
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: UserCreateInput,
  ): Promise<User> {
    try {
      await this.authClient.connect();
      this.logger.log('📤 Sending create_user to auth microservice');
      const createdUser = await lastValueFrom(
        this.authClient.send('create_user', createUserInput),
      );
      this.logger.log(`User created successfully: ${createdUser.email}`);
      return createdUser;
    } catch (err) {
      GraphQLErrorHelper(err);
    }
  }
}
