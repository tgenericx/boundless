import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';

/**
 * Defines the Post model for social media posts
 */
@ObjectType({ description: 'Defines the Post model for social media posts' })
export class Post {
  /**
   * Unique identifier (maps to MongoDB's _id)
   */
  @Field(() => ID, {
    description: "Unique identifier (maps to MongoDB's _id)",
    nullable: false,
  })
  id!: string;

  /**
   * Optional text content of the post
   */
  @Field(() => String, {
    description: 'Optional text content of the post',
    nullable: true,
  })
  textContent!: string | null;

  /**
   * Array of media URLs (photos/videos)
   */
  @Field(() => [String], {
    description: 'Array of media URLs (photos/videos)',
    nullable: true,
  })
  mediaUrls!: Array<string>;

  /**
   * Timestamp of post creation
   */
  @Field(() => Date, {
    description: 'Timestamp of post creation',
    nullable: false,
  })
  createdAt!: Date;

  /**
   * Timestamp of last update
   */
  @Field(() => Date, {
    description: 'Timestamp of last update',
    nullable: false,
  })
  updatedAt!: Date;
}
