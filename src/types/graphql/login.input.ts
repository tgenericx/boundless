import { InputType, Field } from '@nestjs/graphql';
import * as Scalars from 'graphql-scalars';
import { IsOptional, IsStrongPassword } from 'class-validator';
import { AtLeastOneField } from '@/validators/at-least-one-field.validator';

@InputType()
@AtLeastOneField<LoginInput>(['email', 'username', 'phoneNumber'])
export class LoginInput {
  @Field(() => Scalars.GraphQLEmailAddress, { nullable: true })
  @IsOptional()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  username?: string;

  @Field(() => Scalars.GraphQLPhoneNumber, { nullable: true })
  @IsOptional()
  phoneNumber?: string;

  @Field(() => String)
  @IsStrongPassword({
    minLength: 8,
  })
  password!: string;
}
