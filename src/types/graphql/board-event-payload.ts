import { ObjectType, Field } from '@nestjs/graphql';
import { Board } from 'src/@generated/graphql';

@ObjectType()
export class BoardEventPayload {
  @Field()
  type: 'CREATED' | 'UPDATED' | 'REMOVED';

  @Field(() => Board)
  board: Board;
}
