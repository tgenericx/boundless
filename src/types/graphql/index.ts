import { Field, ID } from '@nestjs/graphql';
import { User } from 'generated/graphql';

export * from './auth.input';
export * from './auth.payload';

export class AuthenticatedUser {
  @Field(() => ID, {
    nullable: false,
  })
  userId: User['id'];

  roles: User['roles'];
}
