import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, {
    description: 'The email address of the user',
    nullable: false,
  })
  email: string;

  @Field(() => String, {
    description: 'The hashed password of the user',
    nullable: false,
  })
  password: string;
}
