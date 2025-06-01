import { InputType, Field } from '@nestjs/graphql';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Validate,
} from 'class-validator';
import { EitherTextOrMedia } from '../validators/either-text-or-media.validator';

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
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000, {
    message: 'Text content must be less than 5000 characters',
  })
  textContent?: string;

  /**
   * Array of media URLs (photos/videos)
   */
  @Field(() => [String], {
    description: 'Media URLs (photos/videos)',
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true, message: 'Each media URL must be a valid URL' })
  @IsString({ each: true })
  mediaUrls?: string[];

  /**
   * @hidden
   * Validation decorator to ensure at least one field is provided
   */
  @Validate(EitherTextOrMedia)
  _eitherTextOrMedia?: never;
}
