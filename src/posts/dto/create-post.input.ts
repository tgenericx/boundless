import { InputType, Field } from '@nestjs/graphql';
import { IsString, MaxLength } from 'class-validator';

/**
 * Input type for creating a new post
 * @remarks At least one of textContent or mediaUrls must be provided
 */
@InputType({ description: 'Input for creating a new post' })
export class CreatePostInput {
  /**
   * Text content of the post
   * @maxLength 5000 characters
   */
  @Field(() => String, {
    description: 'Text content of the post',
  })
  @IsString()
  @MaxLength(5000, {
    message: 'Text content must be less than 5000 characters',
  })
  textContent: string;
}
