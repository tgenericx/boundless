import { ObjectType, Field } from '@nestjs/graphql';
import { Post } from '../entities/post.entity';

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post])
  data: Post[];

  @Field(() => String, { nullable: true })
  nextCursor: string | null;
}
