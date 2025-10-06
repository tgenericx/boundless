import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  FindManyUserArgs,
  FindUniqueUserArgs,
  UpdateOneUserArgs,
  User,
} from 'src/@generated/graphql';
import { JwtAuthGuard } from 'src/utils/guards';
import { UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, {
    name: 'user',
    nullable: true,
  })
  findOne(@Args() args: FindUniqueUserArgs) {
    return this.usersService.findOne(args);
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
