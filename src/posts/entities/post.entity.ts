import { Field, ID, ObjectType } from '@nestjs/graphql';

/**
 * Represents a social media post that can contain text, media, or both
 */
@ObjectType({
  description: 'A social media post that can contain text, media, or both',
})
export class Post {
  /**
   * Unique identifier for the post
   */
  @Field(() => ID, { description: 'Unique identifier for the post' })
  id: string;

  /**
   * Text content of the post (optional if media is present)
   */
  @Field(() => String, {
    description: 'Text content of the post (optional if media is present)',
    nullable: true,
  })
  textContent?: string;

  /**
   * Array of media URLs (photos/videos) associated with the post
   */
  @Field(() => [String], {
    description: 'List of media URLs (photos/videos)',
    nullable: true,
  })
  mediaUrls?: string[];

  /**
   * Timestamp when the post was created
   */
  @Field(() => String, { description: 'When the post was created' })
  createdAt: string;
}
