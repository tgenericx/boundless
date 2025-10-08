import { ObjectType, Field } from '@nestjs/graphql';
import { BoardFollower } from '@/generated/graphql';

@ObjectType()
export class FollowerEventPayload {
  @Field()
  type: 'CREATED' | 'REMOVED';

  @Field(() => BoardFollower)
  follower: BoardFollower;
}
