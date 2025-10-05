import { InputType, Field } from '@nestjs/graphql';
import * as Scalars from 'graphql-scalars';
import { IsOptional, MinLength, ValidateIf, IsNotEmpty } from 'class-validator';

@InputType()
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

  @Field(() => String, { nullable: false })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty()
  password!: string;

  @ValidateIf((o: LoginInput) => !o.email && !o.username && !o.phoneNumber)
  @IsNotEmpty({
    message: 'Provide at least one of email, username, or phone number',
  })
  _atLeastOne?: string;
}
