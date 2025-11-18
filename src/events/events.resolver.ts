import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  Event,
  EventCreateInput,
  EventOrganizer,
  EventStatus,
  EventUpdateInput,
  OrganizerRole,
} from '@/generated/graphql';
import { EventsService } from './events.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/utils/guards';
import { CurrentUser } from '@/utils/decorators/current-user.decorator';
import { type AuthenticatedUser } from '@/types';
import { createEventPayload } from '@/types/graphql';
import { EventFilterInput, PaginationInput } from './dto/event.input';

export const EventEventPayload = createEventPayload('eventEvents', Event);

@Resolver(() => Event)
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}

  @Query(() => [Event], {
    name: 'events',
    description: 'List all events with optional filters',
  })
  async getEvents(
    @Args('filter', { nullable: true }) filter?: EventFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<Event[]> {
    return this.eventsService.findAll(filter, pagination);
  }

  @Query(() => Event, {
    name: 'event',
    nullable: true,
    description: 'Get a single event by ID',
  })
  async getEvent(@Args('id') id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Query(() => [Event], {
    name: 'myEvents',
    description: 'Get events created or organized by current user',
  })
  @UseGuards(JwtAuthGuard)
  async getMyEvents(
    @CurrentUser() user: AuthenticatedUser,
    @Args('role', { type: () => OrganizerRole, nullable: true })
    role?: OrganizerRole,
  ): Promise<Event[]> {
    return this.eventsService.findMyEvents(user.userId, role);
  }

  @Mutation(() => Event, { description: 'Create a new event' })
  @UseGuards(JwtAuthGuard)
  async createEvent(
    @Args('input') input: EventCreateInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Event> {
    return this.eventsService.create(input, user.userId);
  }

  @Mutation(() => Event, { description: 'Update an existing event' })
  @UseGuards(JwtAuthGuard)
  async updateEvent(
    @Args('id') id: string,
    @Args('input') input: EventUpdateInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Event> {
    return this.eventsService.update(id, input, user.userId);
  }

  @Mutation(() => Event, {
    description: 'Update event status (publish, cancel, complete)',
  })
  @UseGuards(JwtAuthGuard)
  async updateEventStatus(
    @Args('id') id: string,
    @Args('status', { type: () => EventStatus }) status: EventStatus,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Event> {
    return this.eventsService.updateStatus(id, status, user.userId);
  }

  @Mutation(() => Boolean, { description: 'Delete an event (creator only)' })
  @UseGuards(JwtAuthGuard)
  async deleteEvent(
    @Args('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    return this.eventsService.delete(id, user.userId);
  }

  @Mutation(() => EventOrganizer, {
    description: 'Add an organizer to an event',
  })
  @UseGuards(JwtAuthGuard)
  async addOrganizer(
    @Args('eventId') eventId: string,
    @Args('userId') userId: string,
    @Args('role', { type: () => OrganizerRole }) role: OrganizerRole,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EventOrganizer> {
    return this.eventsService.addOrganizer(eventId, userId, role, user.userId);
  }

  @Mutation(() => Boolean, { description: 'Remove an organizer from an event' })
  @UseGuards(JwtAuthGuard)
  async removeOrganizer(
    @Args('eventId') eventId: string,
    @Args('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    return this.eventsService.removeOrganizer(eventId, userId, user.userId);
  }
}
