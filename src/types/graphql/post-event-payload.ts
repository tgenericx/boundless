import { ObjectType, Field } from '@nestjs/graphql';
import { Post } from 'src/@generated/graphql';

@ObjectType()
export class PostEventPayload {
  @Field()
  type: 'CREATED' | 'UPDATED' | 'REMOVED';

  @Field(() => Post)
  post: Post;
}
