import { ObjectType, Field } from '@nestjs/graphql';
import { UserFollow } from '@/generated/graphql';

@ObjectType()
export class UserFollowEventPayload {
  @Field()
  type: 'FOLLOWED' | 'UNFOLLOWED';

  @Field(() => UserFollow)
  userFollow: UserFollow;
}
