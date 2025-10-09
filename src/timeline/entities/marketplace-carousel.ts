import { Field, ObjectType } from '@nestjs/graphql';
import { Inventory, Listing } from '@/generated/graphql';

@ObjectType()
export class MarketplaceCarousel {
  @Field(() => String)
  id: string;

  @Field(() => [Listing])
  listings: Listing[];

  @Field(() => [Inventory])
  inventories: Inventory[];
}
