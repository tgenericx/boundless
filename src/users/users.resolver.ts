import { Resolver, Query, Mutation, Args, Info } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  FindManyUserArgs,
  FindUniqueUserArgs,
  UpdateOneUserArgs,
  User,
} from '@/generated/graphql';
import { JwtAuthGuard } from '@/utils/guards';
import { UseGuards } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { type GraphQLResolveInfo } from 'graphql';
import { PrismaSelect } from '@paljs/plugins';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, {
    name: 'user',
    nullable: true,
  })
  findOne(@Args() args: FindUniqueUserArgs, @Info() info: GraphQLResolveInfo) {
    const prismaSelect = new PrismaSelect(info)
      .value as Prisma.UserFindUniqueArgs;
    return this.usersService.findOne({
      ...args,
      ...prismaSelect,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  async updateUser(@Args() args: UpdateOneUserArgs) {
    return this.usersService.update({
      where: args.where,
      data: args.data as unknown as Prisma.UserUpdateInput,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  removeUser(@Args() args: FindUniqueUserArgs) {
    return this.usersService.remove(args);
  }

  @Query(() => [User], { name: 'users' })
  findMany(@Args() args: FindManyUserArgs) {
    return this.usersService.findMany(args);
  }
}
