import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import {
  Event,
  EventCreateInput,
  EventStatus,
  EventUpdateInput,
} from '@/generated/graphql';
import { Prisma } from '@/generated/prisma';
import { EventFilter, EventsService } from './events.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/utils/guards';
import { CurrentUser } from '@/utils/decorators/current-user.decorator';
import { type AuthenticatedUser } from '@/types';
import { createEventPayload } from '@/types/graphql';
import { Pagination } from './events.repository';

export const EventEventPayload = createEventPayload('eventEvents', Event);

@Resolver(() => Event)
export class EventsResolver {
  constructor(private service: EventsService) {}

  @Query(() => [Event])
  events(
    @Args('filter', { nullable: true }) filter: EventFilter,
    @Args('pagination', { nullable: true }) pagination: Pagination,
  ) {
    return this.service.list(filter, pagination);
  }

  @Query(() => Event, { nullable: true })
  event(@Args('id', { type: () => ID }) id: string) {
    return this.service.get(id);
  }

  @Mutation(() => Event)
  @UseGuards(JwtAuthGuard)
  createEvent(
    @Args('input') input: EventCreateInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(
      input as unknown as Prisma.EventCreateInput,
      user.userId,
    );
  }

  @Mutation(() => Event)
  @UseGuards(JwtAuthGuard)
  updateEvent(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: EventUpdateInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(
      id,
      input as unknown as Prisma.EventUpdateInput,
      user.userId,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  deleteEvent(@Args('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.userId);
  }

  @Mutation(() => Event)
  @UseGuards(JwtAuthGuard)
  updateEventStatus(
    @Args('id') id: string,
    @Args('status') status: EventStatus,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.updateStatus(id, status, user.userId);
  }
}
