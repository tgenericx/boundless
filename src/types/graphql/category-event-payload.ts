import { ObjectType, Field } from '@nestjs/graphql';
import { Category } from '@/generated/graphql';

@ObjectType()
export class CategoryEventPayload {
  @Field()
  type: 'CREATED' | 'UPDATED' | 'REMOVED';

  @Field(() => Category)
  category: Category;
}
