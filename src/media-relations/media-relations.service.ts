import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Prisma,
  PostMedia,
  ListingMedia,
  InventoryMedia,
} from '@/generated/prisma';

@Injectable()
export class MediaRelationsService {
  constructor(private readonly prisma: PrismaService) {}

  // POST MEDIA
  async attachMediaToPost(
    args: Prisma.PostMediaCreateArgs,
  ): Promise<PostMedia> {
    return this.prisma.postMedia.create(args);
  }

  async detachMediaFromPost(
    args: Prisma.PostMediaDeleteArgs,
  ): Promise<PostMedia> {
    return this.prisma.postMedia.delete(args);
  }

  async findPostMedia(
    args?: Prisma.PostMediaFindManyArgs,
  ): Promise<PostMedia[]> {
    return this.prisma.postMedia.findMany(args);
  }

  // LISTING MEDIA
  async attachMediaToListing(
    args: Prisma.ListingMediaCreateArgs,
  ): Promise<ListingMedia> {
    return this.prisma.listingMedia.create(args);
  }

  async detachMediaFromListing(
    args: Prisma.ListingMediaDeleteArgs,
  ): Promise<ListingMedia> {
    return this.prisma.listingMedia.delete(args);
  }

  async findListingMedia(
    args?: Prisma.ListingMediaFindManyArgs,
  ): Promise<ListingMedia[]> {
    return this.prisma.listingMedia.findMany(args);
  }

  // INVENTORY MEDIA
  async attachMediaToInventory(
    args: Prisma.InventoryMediaCreateArgs,
  ): Promise<InventoryMedia> {
    return this.prisma.inventoryMedia.create(args);
  }

  async detachMediaFromInventory(
    args: Prisma.InventoryMediaDeleteArgs,
  ): Promise<InventoryMedia> {
    return this.prisma.inventoryMedia.delete(args);
  }

  async findInventoryMedia(
    args?: Prisma.InventoryMediaFindManyArgs,
  ): Promise<InventoryMedia[]> {
    return this.prisma.inventoryMedia.findMany(args);
  }
}
