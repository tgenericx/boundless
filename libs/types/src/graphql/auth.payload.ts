import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@boundless/types/graphql';

@ObjectType()
export class AuthPayload {
  @Field(() => String, {
    nullable: true,
  })
  accessToken: string;

  @Field(() => String, {
    nullable: true,
  })
  refreshToken: string;

  @Field(() => User, {
    nullable: true,
  })
  user: User;
}
