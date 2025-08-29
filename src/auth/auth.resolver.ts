import { Resolver, Mutation, Args, Query, Boolean } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Logger, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../utils/guards';
import { CurrentUser } from '../utils/decorators';
import { CreateOneUserArgs, User } from 'generated/graphql';
import { AuthenticatedUser, AuthPayload, LoginInput } from 'src/types/graphql';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  root(): string {
    return 'Root query to satisfy GraphQL schema requirements';
  }

  @Mutation(() => User)
  async createUser(@Args() input: CreateOneUserArgs): Promise<User> {
    return await this.authService.signup(input);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    this.logger.log('📤 Sending login RPC...');
    return await this.authService.login(input.email, input.password);
  }

  @Mutation(() => AuthPayload)
  async refresh(@Args('refreshToken') token: string): Promise<AuthPayload> {
    return await this.authService.refreshToken(token);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async me(@CurrentUser() user: AuthenticatedUser): Promise<User> {
    return await this.authService.getUserById(user.userId);
  }

  @Mutation(() => Boolean)
  async logout(@Args('refreshToken') refreshToken: string): Promise<boolean> {
    await this.authService.logout(refreshToken);
    return true;
  }
}
