import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserInput, User } from '@boundless/prisma-service';

@Resolver()
export class AppResolver {
  private readonly logger = new Logger(AppResolver.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Query(() => String)
  root(): string {
    return 'Root query to satisfy GraphQL schema requirements';
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    try {
      const createdUser = await this.authClient
        .send<User>('create_user', createUserInput)
        .toPromise();

      this.logger.log(`User created successfully: ${createdUser.email}`);
      return createdUser;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }
}
