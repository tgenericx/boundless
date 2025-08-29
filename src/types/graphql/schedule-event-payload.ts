import { ObjectType, Field } from '@nestjs/graphql';
import { ScheduleItem } from 'src/@generated/graphql';

@ObjectType()
export class ScheduleEventPayload {
  @Field()
  type: 'CREATED' | 'UPDATED' | 'REMOVED';

  @Field(() => ScheduleItem)
  schedule: ScheduleItem;
}
