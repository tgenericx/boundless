import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  ScheduleItem,
  FindManyScheduleItemArgs,
  FindUniqueScheduleItemArgs,
  CreateOneScheduleItemArgs,
  UpdateOneScheduleItemArgs,
  DeleteOneScheduleItemArgs,
} from 'src/@generated/graphql';
import { SchedulesService } from './schedules.service';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { ScheduleEventPayload } from 'src/types/graphql/schedule-event-payload';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/guards';

@Resolver(() => ScheduleItem)
export class SchedulesResolver {
  constructor(
    private readonly schedulesService: SchedulesService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ScheduleItem)
  async createSchedule(@Args() args: CreateOneScheduleItemArgs) {
    const schedule = await this.schedulesService.create(args);
    await this.pubSub.publish('scheduleEvents', {
      scheduleEvents: { type: 'CREATED', schedule },
    });
    return schedule;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ScheduleItem)
  async updateSchedule(@Args() args: UpdateOneScheduleItemArgs) {
    const schedule = await this.schedulesService.update(args);
    await this.pubSub.publish('scheduleEvents', {
      scheduleEvents: { type: 'UPDATED', schedule },
    });
    return schedule;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ScheduleItem)
  async removeSchedule(@Args() args: DeleteOneScheduleItemArgs) {
    const schedule = await this.schedulesService.remove(args);
    await this.pubSub.publish('scheduleEvents', {
      scheduleEvents: { type: 'REMOVED', schedule },
    });
    return schedule;
  }

  // queries remain public for now
  @Query(() => [ScheduleItem])
  schedules(@Args() args: FindManyScheduleItemArgs) {
    return this.schedulesService.findMany(args);
  }

  @Query(() => ScheduleItem, { nullable: true })
  schedule(@Args() args: FindUniqueScheduleItemArgs) {
    return this.schedulesService.findOne(args);
  }

  @Subscription(() => ScheduleEventPayload, {
    name: 'scheduleEvents',
    description: 'Fires whenever a schedule is created, updated, or removed',
  })
  scheduleEvents() {
    return this.pubSub.asyncIterableIterator('scheduleEvents');
  }
}
