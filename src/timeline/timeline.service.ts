import { Injectable } from '@nestjs/common';
import { PostsService } from '@/posts/posts.service';
import { EventsService } from '@/events/events.service';
import { ListingsService } from '@/listings/listings.service';
import { InventoriesService } from '@/inventories/inventories.service';
import { TimelinePaginationArgs } from './dto/timeline-pagination.args';
import { Prisma } from 'generated/prisma';
import { PageInfo, TimelineFeedItem } from './entities/timeline.model';

@Injectable()
export class TimelineService {
  constructor(
    private readonly postsService: PostsService,
    private readonly eventsService: EventsService,
    private readonly listingsService: ListingsService,
    private readonly inventoriesService: InventoriesService,
  ) {}

  async getTimelineFeed(
    userId: string,
    args: TimelinePaginationArgs,
  ): Promise<{ items: TimelineFeedItem[]; pageInfo: PageInfo }> {
    const { after, before, limit, since } = args;

    const where: Prisma.PostWhereInput = {};
    if (since) where.createdAt = { gte: since };

    const cursor: Prisma.PostWhereUniqueInput | undefined = after
      ? { id: after }
      : before
        ? { id: before }
        : undefined;

    const orderBy: Prisma.PostOrderByWithRelationInput = {
      createdAt: before ? 'asc' : 'desc',
    };

    const posts = await this.postsService.findMany({
      where,
      cursor,
      take: limit,
      skip: cursor ? 1 : 0,
      orderBy,
    });

    const includeCarousels = !after && !before;
    let feed: TimelineFeedItem[] = [...posts];

    if (includeCarousels) {
      const [events, listings, inventories] = await Promise.all([
        this.eventsService.findMany({ take: 5 }),
        this.listingsService.findMany({ take: 5 }),
        this.inventoriesService.findMany({ take: 5 }),
      ]);

      const eventCarousel: TimelineFeedItem = {
        id: 'carousel-events',
        type: 'EVENT_CAROUSEL',
        events,
      };

      const marketplaceCarousel: TimelineFeedItem = {
        id: 'carousel-marketplace',
        type: 'MARKETPLACE_CAROUSEL',
        listings,
        inventories,
      };

      const withCarousels: TimelineFeedItem[] = [];

      for (let i = 0; i < feed.length; i++) {
        withCarousels.push(feed[i]);
        if (i === 3) withCarousels.push(eventCarousel);
        if (i === 7) withCarousels.push(marketplaceCarousel);
      }

      feed = withCarousels;
    }

    const nextCursor = posts.length ? posts[posts.length - 1].id : undefined;
    const prevCursor = posts.length ? posts[0].id : undefined;

    return {
      items: feed,
      pageInfo: {
        nextCursor,
        prevCursor,
        hasNextPage: !!nextCursor,
        hasPrevPage: !!before,
      },
    };
  }
}
