import { Resolver, Mutation, Args, Query, Info } from '@nestjs/graphql';
import { GraphQLBoolean, type GraphQLResolveInfo } from 'graphql';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RefreshJwtGuard } from '@/utils/guards';
import { CurrentUser } from '@/utils/decorators';
import { PrismaSelect } from '@paljs/plugins';
import { Prisma } from '@/generated/prisma';
import { User } from '@/generated/graphql';
import { AuthPayload, CreateUserInput, LoginInput } from '@/types/graphql';
import type { AuthenticatedUser } from '@/types';

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

  @Mutation(() => AuthPayload)
  async createUser(@Args('input') input: CreateUserInput): Promise<AuthPayload> {
    return this.authService.signup({
      data: input,
    });
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    this.logger.log('📤 Sending login request...');
    return this.authService.login(input);
  }

  @UseGuards(RefreshJwtGuard)
  @Mutation(() => AuthPayload)
  async refresh(
    @Args('refreshToken') refreshToken: string,
  ): Promise<AuthPayload> {
    return await this.authService.refreshToken(refreshToken);
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
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    return foundUser;
  }

  @Mutation(() => GraphQLBoolean)
  async verifyEmail(
    @Args('verificationToken') verificationToken: string,
  ): Promise<boolean> {
    return await this.authService.verifyEmail(verificationToken);
  }

  @Mutation(() => GraphQLBoolean)
  async logout(@Args('refreshToken') refreshToken: string): Promise<boolean> {
    await this.authService.logout(refreshToken);
    return true;
  }
}
