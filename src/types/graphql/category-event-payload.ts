import { ObjectType, Field } from '@nestjs/graphql';
import { Category } from 'src/@generated/graphql';

@ObjectType()
export class CategoryEventPayload {
  @Field()
  type: 'CREATED' | 'UPDATED' | 'REMOVED';

  @Field(() => Category)
  category: Category;
}
