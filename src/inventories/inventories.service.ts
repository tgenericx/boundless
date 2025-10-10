import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Inventory, Prisma } from '@/generated/prisma';

@Injectable()
export class InventoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.InventoryCreateArgs): Promise<Inventory> {
    return this.prisma.inventory.create(args);
  }

  async findOne(
    args: Prisma.InventoryFindUniqueArgs,
  ): Promise<Inventory | null> {
    const inventory = await this.prisma.inventory.findUnique(args);
    return inventory;
  }

  async findMany(args?: Prisma.InventoryFindManyArgs): Promise<Inventory[]> {
    return this.prisma.inventory.findMany(args);
  }

  async update(args: Prisma.InventoryUpdateArgs): Promise<Inventory> {
    return this.prisma.inventory.update(args);
  }

  async remove(args: Prisma.InventoryDeleteArgs): Promise<Inventory> {
    return this.prisma.inventory.delete(args);
  }
}
