import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Listing, Prisma } from '@/generated/prisma';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.ListingCreateArgs): Promise<Listing> {
    return this.prisma.listing.create(args);
  }

  async findOne(args: Prisma.ListingFindUniqueArgs): Promise<Listing | null> {
    return this.prisma.listing.findUnique(args);
  }

  async findMany(args?: Prisma.ListingFindManyArgs): Promise<Listing[]> {
    return this.prisma.listing.findMany(args);
  }

  async update(args: Prisma.ListingUpdateArgs): Promise<Listing> {
    return this.prisma.listing.update(args);
  }

  async remove(args: Prisma.ListingDeleteArgs): Promise<Listing> {
    return this.prisma.listing.delete(args);
  }
}
