import { ObjectType, Field } from '@nestjs/graphql';
import { Media } from 'src/@generated/graphql';

@ObjectType()
export class MediaEventPayload {
  @Field()
  type: 'CREATED' | 'UPDATED' | 'REMOVED';

  @Field(() => Media)
  media: Media;
}
