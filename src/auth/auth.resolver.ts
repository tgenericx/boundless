import { Resolver, Mutation, Args, Query, Info } from '@nestjs/graphql';
import { GraphQLBoolean, type GraphQLResolveInfo } from 'graphql';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../utils/guards';
import { CurrentUser } from '../utils/decorators';
import { CreateOneUserArgs, User } from 'generated/graphql';
import { AuthenticatedUser, AuthPayload, LoginInput } from 'src/types/graphql';
import { PrismaSelect } from '@paljs/plugins';
import { Prisma } from '@prisma/client';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private readonly authService: AuthService,
    private readonly user: UsersService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Mutation(() => AuthPayload)
  async refresh(@Args('refreshToken') token: string): Promise<AuthPayload> {
    return await this.authService.refreshToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async profile(
    @CurrentUser() user: AuthenticatedUser,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User> {
    const prismaSelect = new PrismaSelect(info)
      .value as Prisma.UserFindUniqueArgs;

    const foundUser = await this.user.findOne({
      ...prismaSelect,
      where: {
        id: user.userId,
        ...(prismaSelect.where ?? {}),
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    return foundUser;
  }

  @Mutation(() => GraphQLBoolean)
  async logout(@Args('refreshToken') refreshToken: string): Promise<boolean> {
    await this.authService.logout(refreshToken);
    return true;
  }
}
