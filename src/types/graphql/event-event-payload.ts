import { ObjectType, Field } from '@nestjs/graphql';
import { Event } from '@/generated/graphql';

@ObjectType()
export class EventEventPayload {
  @Field()
  type: 'CREATED' | 'UPDATED' | 'REMOVED';

  @Field(() => Event)
  schedule: Event;
}
