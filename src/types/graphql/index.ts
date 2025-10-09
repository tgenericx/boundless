import { Field, ID } from '@nestjs/graphql';
import { User } from '@/generated/graphql';

export * from './login.input';
export * from './auth.payload';
export * from './event.payload';
export * from './post-pag.args';

export class AuthenticatedUser {
  @Field(() => ID, {
    nullable: false,
  })
  userId: User['id'];

  roles: User['roles'];
}
