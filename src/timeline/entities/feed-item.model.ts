import { createUnionType } from '@nestjs/graphql';
import { Post } from '@/generated/graphql';
import { EventCarousel } from './event-carousel';
import { MarketplaceCarousel } from './marketplace-carousel';

export const FeedItem = createUnionType({
  name: 'FeedItem',
  types: () => [Post, EventCarousel, MarketplaceCarousel] as const,
  resolveType(value) {
    if ('content' in value && 'author' in value) return Post;
    if ('events' in value) return EventCarousel;
    if ('listings' in value && 'inventories' in value)
      return MarketplaceCarousel;
    return null;
  },
});
