import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID, {
    description: 'Unique identifier for the user',
    nullable: false,
  })
  id: number;

  @Field(() => String, {
    description: 'The email address of the user',
    nullable: false,
  })
  email: string;

  @Field(() => String, {
    description: 'The hashed password of the user',
    nullable: true,
  })
  password: string;

  @Field(() => Date, {
    description: 'Timestamp of when the user was created',
    nullable: false,
  })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Timestamp of the last update to the user profile',
    nullable: false,
  })
  updatedAt: Date;
}
