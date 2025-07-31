import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import {
  User,
  UserCreateInput,
  AuthPayload,
  LoginInput,
} from '@boundless/types/graphql';
import { AuthService } from './auth.service';
import { Logger } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  root(): string {
    return 'Root query to satisfy GraphQL schema requirements';
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') input: UserCreateInput,
  ): Promise<User> {
    this.logger.log('📤 Sending createUser RPC...');
    return this.authService.createUser(input);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    this.logger.log('📤 Sending login RPC...');
    return this.authService.login(input);
  }
}
