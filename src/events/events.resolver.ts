import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  Event,
  FindManyEventArgs,
  FindUniqueEventArgs,
  CreateOneEventArgs,
  UpdateOneEventArgs,
  DeleteOneEventArgs,
  Role,
} from '@/generated/graphql';
import { EventsService } from './events.service';
import {
  Inject,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard } from '@/utils/guards';
import { CurrentUser } from '@/utils/decorators/current-user.decorator';
import { type AuthenticatedUser } from '@/types';
import { Prisma } from '@/generated/prisma';
import { createEventPayload } from '@/types/graphql';

export const EventEventPayload = createEventPayload('eventEvents', Event);

@Resolver(() => Event)
export class EventsResolver {
  constructor(
    private readonly eventsService: EventsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Event)
  async createEvent(
    @Args() args: CreateOneEventArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const event = await this.eventsService.create({
      data: {
        ...args.data,
        createdBy: { connect: { id: user.userId } },
      } as unknown as Prisma.EventCreateInput,
    });

    await this.pubSub.publish('eventEvents', {
      eventEvents: { type: 'CREATED', event },
    });
    return event;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Event)
  async updateEvent(
    @Args() args: UpdateOneEventArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const event = await this.eventsService.findOne({ where: args.where });
    if (!event) throw new NotFoundException('Event not found');

    const isOwner = event.userId === user.userId;
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not authorized to update this event');
    }

    const updated = await this.eventsService.update(
      args as unknown as Prisma.EventUpdateArgs,
    );
    await this.pubSub.publish('eventEvents', {
      eventEvents: { type: 'UPDATED', event: updated },
    });
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Event)
  async removeEvent(
    @Args() args: DeleteOneEventArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const event = await this.eventsService.findOne({ where: args.where });
    if (!event) throw new NotFoundException('Event not found');

    const isOwner = event.userId === user.userId;
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not authorized to delete this event');
    }

    const removed = await this.eventsService.remove(
      args as unknown as Prisma.EventDeleteArgs,
    );
    await this.pubSub.publish('eventEvents', {
      eventEvents: { type: 'REMOVED', event: removed },
    });
    return removed;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Event])
  async events(
    @Args() args: FindManyEventArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);
    if (!isAdmin) {
      args.where = { ...args.where, userId: { equals: user.userId } };
    }
    return this.eventsService.findMany(args);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Event, { nullable: true })
  event(@Args() args: FindUniqueEventArgs) {
    return this.eventsService.findOne(args);
  }

  @UseGuards(JwtAuthGuard)
  @Subscription(() => EventEventPayload, {
    name: 'eventEvents',
    description: 'Fires whenever an event is created, updated, or removed',
  })
  eventEvents() {
    return this.pubSub.asyncIterableIterator('eventEvents');
  }
}
