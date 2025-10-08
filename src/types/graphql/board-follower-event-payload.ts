import { ObjectType, Field } from '@nestjs/graphql';
import { BoardFollower } from '@/generated/graphql';

@ObjectType()
export class BoardFollowerEventPayload {
  @Field()
  type: 'SUBSCRIBED' | 'UNSUBSCRIBED';

  @Field(() => BoardFollower)
  boardFollower: BoardFollower;
}
