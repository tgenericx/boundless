import { ObjectType, Field } from '@nestjs/graphql';
import { Event } from 'src/@generated/graphql';

@ObjectType()
export class EventEventPayload {
  @Field()
  type: 'CREATED' | 'UPDATED' | 'REMOVED';

  @Field(() => Event)
  schedule: Event;
}
