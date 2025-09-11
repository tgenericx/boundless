import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import {
  ScheduleItem,
  FindManyScheduleItemArgs,
  FindUniqueScheduleItemArgs,
  CreateOneScheduleItemArgs,
  UpdateOneScheduleItemArgs,
  DeleteOneScheduleItemArgs,
  Role,
} from 'src/@generated/graphql';
import { SchedulesService } from './schedules.service';
import {
  Inject,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { ScheduleEventPayload } from 'src/types/graphql/schedule-event-payload';
import { JwtAuthGuard } from 'src/utils/guards';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/types/graphql';

@Resolver(() => ScheduleItem)
export class SchedulesResolver {
  constructor(
    private readonly schedulesService: SchedulesService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ScheduleItem)
  async createSchedule(
    @Args() args: CreateOneScheduleItemArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const schedule = await this.schedulesService.create({
      ...args,
      data: {
        ...args.data,
        createdBy: { connect: { id: user.userId } },
      },
    });
    await this.pubSub.publish('scheduleEvents', {
      scheduleEvents: { type: 'CREATED', schedule },
    });
    return schedule;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ScheduleItem)
  async updateSchedule(
    @Args() args: UpdateOneScheduleItemArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const schedule = await this.schedulesService.findOne({ where: args.where });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const isOwner = schedule.userId === user.userId;
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not authorized to update this schedule');
    }

    const updated = await this.schedulesService.update(args);
    await this.pubSub.publish('scheduleEvents', {
      scheduleEvents: { type: 'UPDATED', schedule: updated },
    });
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ScheduleItem)
  async removeSchedule(
    @Args() args: DeleteOneScheduleItemArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const schedule = await this.schedulesService.findOne({ where: args.where });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const isOwner = schedule.userId === user.userId;
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not authorized to delete this schedule');
    }

    const removed = await this.schedulesService.remove(args);
    await this.pubSub.publish('scheduleEvents', {
      scheduleEvents: { type: 'REMOVED', schedule: removed },
    });
    return removed;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [ScheduleItem])
  async schedules(
    @Args() args: FindManyScheduleItemArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin =
      Array.isArray(user?.roles) && user.roles.includes(Role.ADMIN);
    if (!isAdmin) {
      args.where = { ...args.where, userId: { equals: user.userId } };
    }
    return this.schedulesService.findMany(args);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => ScheduleItem, { nullable: true })
  schedule(@Args() args: FindUniqueScheduleItemArgs) {
    return this.schedulesService.findOne(args);
  }

  @UseGuards(JwtAuthGuard)
  @Subscription(() => ScheduleEventPayload, {
    name: 'scheduleEvents',
    description: 'Fires whenever a schedule is created, updated, or removed',
  })
  scheduleEvents() {
    return this.pubSub.asyncIterableIterator('scheduleEvents');
  }
}
