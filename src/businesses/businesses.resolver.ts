import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  Business,
  CreateOneBusinessArgs,
  UpdateOneBusinessArgs,
  DeleteOneBusinessArgs,
  FindManyBusinessArgs,
  FindUniqueBusinessArgs,
} from '@/generated/graphql';
import { BusinessesService } from './businesses.service';
import {
  Inject,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/utils/guards';
import { CurrentUser } from '@/utils/decorators';
import { type AuthenticatedUser } from '@/types';
import { PubSub } from 'graphql-subscriptions';
import { Prisma } from '@/generated/prisma';
import { createEventPayload } from '@/types/graphql';

export const BusinessEventPayload = createEventPayload(
  'BusinessEventPayload',
  Business,
);

@UseGuards(JwtAuthGuard)
@Resolver(() => Business)
export class BusinessesResolver {
  constructor(
    private readonly businessesService: BusinessesService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  /**
   * Create a Business — owned by the current user.
   */
  @Mutation(() => Business)
  async createBusiness(
    @CurrentUser() user: AuthenticatedUser,
    @Args() args: CreateOneBusinessArgs,
  ) {
    const business = await this.businessesService.create({
      data: {
        ...args.data,
        owner: {
          connect: { id: user.userId },
        },
      } as unknown as Prisma.BusinessCreateInput,
    });

    await this.pubSub.publish('businessEvents', {
      businessEvents: { type: 'CREATED', business },
    });

    return business;
  }

  /**
   * Update Business — only owner or admin can update.
   */
  @Mutation(() => Business)
  async updateBusiness(
    @CurrentUser() user: AuthenticatedUser,
    @Args() args: UpdateOneBusinessArgs,
  ) {
    const existing = await this.businessesService.findOne({
      where: args.where,
    });
    if (!existing) throw new NotFoundException('Business not found');

    const isOwner = existing.userId === user.userId;
    const isAdmin = Array.isArray(user.roles) && user.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not authorized to update this business');
    }

    const updated = await this.businessesService.update({
      where: args.where,
      data: args.data as unknown as Prisma.BusinessUpdateInput,
    });

    await this.pubSub.publish('businessEvents', {
      businessEvents: { type: 'UPDATED', business: updated },
    });

    return updated;
  }

  /**
   * Remove Business — only owner or admin can delete.
   */
  @Mutation(() => Business)
  async removeBusiness(
    @CurrentUser() user: AuthenticatedUser,
    @Args() args: DeleteOneBusinessArgs,
  ) {
    const existing = await this.businessesService.findOne({
      where: args.where,
    });
    if (!existing) throw new NotFoundException('Business not found');

    const isOwner = existing.userId === user.userId;
    const isAdmin = Array.isArray(user.roles) && user.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not authorized to delete this business');
    }

    const removed = await this.businessesService.remove(args);

    await this.pubSub.publish('businessEvents', {
      businessEvents: { type: 'REMOVED', business: removed },
    });

    return removed;
  }

  /**
   * Query all Businesses — admin sees all, user sees only theirs.
   */
  @Query(() => [Business])
  async businesses(
    @Args() args: FindManyBusinessArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = Array.isArray(user.roles) && user.roles.includes('ADMIN');

    if (!isAdmin) {
      args.where = { ...args.where, userId: { equals: user.userId } };
    }

    return this.businessesService.findMany(args);
  }

  /**
   * Query a single Business
   */
  @Query(() => Business, { nullable: true })
  async business(@Args() args: FindUniqueBusinessArgs) {
    return this.businessesService.findOne(args);
  }

  /**
   * Real-time Business Event Subscriptions
   */
  @Subscription(() => BusinessEventPayload, {
    name: 'businessEvents',
    description: 'Triggers on business creation, update, or removal.',
  })
  businessEvents() {
    return this.pubSub.asyncIterableIterator('businessEvents');
  }
}
