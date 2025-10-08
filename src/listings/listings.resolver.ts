import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  CreateOneListingArgs,
  DeleteOneListingArgs,
  FindManyListingArgs,
  FindUniqueListingArgs,
  Listing,
  UpdateOneListingArgs,
} from '@/generated/graphql';
import { ListingsService } from './listings.service';
import { Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/utils/guards';
import { CurrentUser } from '@/utils/decorators';
import { type AuthenticatedUser } from '@/types';
import { PubSub } from 'graphql-subscriptions';
import { Prisma } from 'generated/prisma';
import { createEventPayload } from '@/types/graphql';

export const ListingEventPayload = createEventPayload('listingEvents', Listing);

@Resolver(() => Listing)
export class ListingsResolver {
  constructor(
    private readonly listingsService: ListingsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Listing)
  async createListing(
    @CurrentUser() user: AuthenticatedUser,
    @Args() args: CreateOneListingArgs,
  ) {
    const listing = await this.listingsService.create({
      data: {
        ...args.data,
        user: { connect: { id: user.userId } },
      } as unknown as Prisma.ListingCreateInput,
    });

    await this.pubSub.publish('listingEvents', {
      listingEvents: { type: 'CREATED', listing },
    });

    return listing;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Listing)
  async updateListing(
    @CurrentUser() user: AuthenticatedUser,
    @Args() args: UpdateOneListingArgs,
  ) {
    const updated = await this.listingsService.update({
      ...args,
      where: { id: args.where.id, userId: user.userId },
    } as unknown as Prisma.ListingUpdateArgs);

    await this.pubSub.publish('listingEvents', {
      listingEvents: { type: 'UPDATED', listing: updated },
    });

    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Listing)
  async removeListing(
    @CurrentUser() user: AuthenticatedUser,
    @Args() args: DeleteOneListingArgs,
  ) {
    const removed = await this.listingsService.remove({
      where: { id: args.where.id, userId: user.userId },
    });

    await this.pubSub.publish('listingEvents', {
      listingEvents: { type: 'REMOVED', listing: removed },
    });

    return removed;
  }

  @Query(() => [Listing])
  async listings(@Args() args?: FindManyListingArgs) {
    return this.listingsService.findMany(args);
  }

  @Query(() => Listing, { nullable: true })
  async listing(@Args() args: FindUniqueListingArgs) {
    return this.listingsService.findOne(args);
  }

  @Subscription(() => ListingEventPayload, { name: 'listingEvents' })
  listingEvents() {
    return this.pubSub.asyncIterableIterator('listingEvents');
  }
}
