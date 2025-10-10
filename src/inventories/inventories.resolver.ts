import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  CreateOneInventoryArgs,
  DeleteOneInventoryArgs,
  FindManyInventoryArgs,
  FindUniqueInventoryArgs,
  Inventory,
  UpdateOneInventoryArgs,
} from '@/generated/graphql';
import { InventoriesService } from './inventories.service';
import { Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/utils/guards';
import { CurrentUser } from '@/utils/decorators';
import { type AuthenticatedUser } from '@/types';
import { PubSub } from 'graphql-subscriptions';
import { Prisma } from '@/generated/prisma';
import { createEventPayload } from '@/types/graphql';

export const InventoryEventPayload = createEventPayload(
  'inventoryEvents',
  Inventory,
);

@Resolver(() => Inventory)
export class InventoriesResolver {
  constructor(
    private readonly inventoriesService: InventoriesService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Inventory)
  async createInventory(
    @CurrentUser() user: AuthenticatedUser,
    @Args() args: CreateOneInventoryArgs,
  ) {
    const inventory = await this.inventoriesService.create({
      data: {
        ...args.data,
        business: {
          connect: { id: user.userId },
        },
      } as unknown as Prisma.InventoryCreateInput,
    });

    await this.pubSub.publish('inventoryEvents', {
      inventoryEvents: { type: 'CREATED', inventory },
    });

    return inventory;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Inventory)
  async updateInventory(
    @CurrentUser() user: AuthenticatedUser,
    @Args() args: UpdateOneInventoryArgs,
  ) {
    const updated = await this.inventoriesService.update({
      ...args,
      where: {
        id: args.where.id,
        business: {
          id: user.userId,
        },
      },
    } as unknown as Prisma.InventoryUpdateArgs);

    await this.pubSub.publish('inventoryEvents', {
      inventoryEvents: { type: 'UPDATED', inventory: updated },
    });

    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Inventory)
  async removeInventory(
    @CurrentUser() user: AuthenticatedUser,
    @Args() args: DeleteOneInventoryArgs,
  ) {
    const removed = await this.inventoriesService.remove({
      where: {
        id: args.where.id,
        business: {
          id: user.userId,
        },
      },
    });

    await this.pubSub.publish('inventoryEvents', {
      inventoryEvents: { type: 'REMOVED', inventory: removed },
    });

    return removed;
  }

  @Query(() => [Inventory])
  async inventories(@Args() args?: FindManyInventoryArgs) {
    return this.inventoriesService.findMany(args);
  }

  @Query(() => Inventory, { nullable: true })
  async inventory(@Args() args: FindUniqueInventoryArgs) {
    return this.inventoriesService.findOne(args);
  }

  @Subscription(() => InventoryEventPayload, { name: 'inventoryEvents' })
  inventoryEvents() {
    return this.pubSub.asyncIterableIterator('inventoryEvents');
  }
}
