import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  FindManyUserArgs,
  FindUniqueUserArgs,
  UpdateOneUserArgs,
  User,
} from 'src/@generated/graphql';

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

  @Mutation(() => User)
  updateUser(@Args() args: UpdateOneUserArgs) {
    return this.usersService.update(args);
  }

  @Mutation(() => User)
  removeUser(@Args() args: FindUniqueUserArgs) {
    return this.usersService.remove(args);
  }

  @Query(() => [User], { name: 'users' })
  findMany(@Args() args: FindManyUserArgs) {
    return this.usersService.findMany(args);
  }
}
