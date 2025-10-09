import { Field, ObjectType } from '@nestjs/graphql';
import { FeedItem } from './feed-item.model';

import { Post, Event, Listing, Inventory } from '@/generated/graphql';

export type TimelineFeedItem =
  | Post
  | { id: string; type: 'EVENT_CAROUSEL'; events: Event[] }
  | {
    id: string;
    type: 'MARKETPLACE_CAROUSEL';
    listings: Listing[];
    inventories: Inventory[];
  };

@ObjectType()
export class PageInfo {
  @Field({ nullable: true })
  nextCursor?: string;

  @Field({ nullable: true })
  prevCursor?: string;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPrevPage: boolean;
}

@ObjectType()
export class TimelineConnection {
  @Field(() => [FeedItem])
  items: (typeof FeedItem)[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
