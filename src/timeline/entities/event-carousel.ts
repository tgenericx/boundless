import { Event } from '@/generated/graphql';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EventCarousel {
  @Field(() => String)
  id: string;

  @Field(() => [Event])
  events: Event[];
}
