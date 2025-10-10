import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import {
  PostMedia,
  ListingMedia,
  InventoryMedia,
  CreateOnePostMediaArgs,
  DeleteOnePostMediaArgs,
  CreateOneListingMediaArgs,
  DeleteOneListingMediaArgs,
  CreateOneInventoryMediaArgs,
  DeleteOneInventoryMediaArgs,
} from '@/generated/graphql';
import { MediaRelationsService } from './media-relations.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/utils/guards';
import { Prisma } from '@/generated/prisma';

@Resolver()
export class MediaRelationsResolver {
  constructor(private readonly service: MediaRelationsService) {}

  // POST MEDIA
  @UseGuards(JwtAuthGuard)
  @Mutation(() => PostMedia)
  attachMediaToPost(@Args() args: CreateOnePostMediaArgs) {
    return this.service.attachMediaToPost(
      args as unknown as Prisma.PostMediaCreateArgs,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => PostMedia)
  detachMediaFromPost(@Args() args: DeleteOnePostMediaArgs) {
    return this.service.detachMediaFromPost(
      args as unknown as Prisma.PostMediaDeleteArgs,
    );
  }

  @Query(() => [PostMedia])
  postMedia() {
    return this.service.findPostMedia();
  }

  // LISTING MEDIA
  @UseGuards(JwtAuthGuard)
  @Mutation(() => ListingMedia)
  attachMediaToListing(@Args() args: CreateOneListingMediaArgs) {
    return this.service.attachMediaToListing(
      args as unknown as Prisma.ListingMediaCreateArgs,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ListingMedia)
  detachMediaFromListing(@Args() args: DeleteOneListingMediaArgs) {
    return this.service.detachMediaFromListing(
      args as unknown as Prisma.ListingMediaDeleteArgs,
    );
  }

  @Query(() => [ListingMedia])
  listingMedia() {
    return this.service.findListingMedia();
  }

  // INVENTORY MEDIA
  @UseGuards(JwtAuthGuard)
  @Mutation(() => InventoryMedia)
  attachMediaToInventory(@Args() args: CreateOneInventoryMediaArgs) {
    return this.service.attachMediaToInventory(
      args as unknown as Prisma.InventoryMediaCreateArgs,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => InventoryMedia)
  detachMediaFromInventory(@Args() args: DeleteOneInventoryMediaArgs) {
    return this.service.detachMediaFromInventory(
      args as unknown as Prisma.InventoryMediaDeleteArgs,
    );
  }

  @Query(() => [InventoryMedia])
  inventoryMedia() {
    return this.service.findInventoryMedia();
  }
}
