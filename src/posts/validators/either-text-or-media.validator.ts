import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { CreatePostInput } from '../dto/create-post.input';

/**
 * Validates that either textContent or mediaUrls is provided in a post
 */
@ValidatorConstraint({ name: 'EitherTextOrMedia', async: false })
export class EitherTextOrMedia implements ValidatorConstraintInterface {
  /**
   * Validates the input object
   * @param value - Not used (placeholder for the validator)
   * @param args - Validation arguments containing the object being validated
   * @returns true if either textContent or mediaUrls is provided
   */
  validate(_value: never, args: ValidationArguments): boolean {
    const post = args.object as CreatePostInput;
    return !!(
      post.textContent?.trim() ||
      (post.mediaUrls && post.mediaUrls.length > 0)
    );
  }

  /**
   * Default error message when validation fails
   */
  defaultMessage(): string {
    return 'Post must contain either text content or media URLs';
  }
}
