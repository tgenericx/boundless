import { ObjectType, Field } from '@nestjs/graphql';
import { Board } from '@/generated/graphql';

@ObjectType()
export class BoardEventPayload {
  @Field()
  type: 'CREATED' | 'UPDATED' | 'REMOVED';

  @Field(() => Board)
  board: Board;
}
