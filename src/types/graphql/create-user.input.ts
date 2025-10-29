import { InputType, Field } from '@nestjs/graphql';
import * as Scalars from 'graphql-scalars';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => Scalars.GraphQLEmailAddress)
  @IsNotEmpty()
  email!: string;

  @Field(() => String)
  @IsNotEmpty()
  username!: string;

  @Field(() => String)
  @IsStrongPassword({
    minLength: 8,
  })
  password!: string;
}
