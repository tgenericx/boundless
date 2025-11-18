import { Injectable } from '@nestjs/common';
import { ArgsType } from '@nestjs/graphql';
import { EventRepository, Pagination } from './events.repository';
import { EventPermission } from './events.permission';
import { EventStatus, Prisma } from '@/generated/prisma';

@ArgsType()
export class EventFilter {
  status?: EventStatus;
  categoryId?: string;
  isPublic?: boolean;
  startTimeFrom?: Date;
  startTimeTo?: Date;
}

@Injectable()
export class EventsService {
  constructor(
    private repo: EventRepository,
    private permission: EventPermission,
  ) {}

  list(filter: EventFilter, pagination: Pagination) {
    const where = this.buildFilter(filter);
    return this.repo.findManyEvents(where, pagination);
  }

  get(id: string) {
    return this.repo.findById(id);
  }

  async create(input: Prisma.EventCreateInput, userId: string) {
    return this.repo.create({
      ...input,
      createdBy: {
        connect: {
          id: userId,
        },
      },
      status: EventStatus.DRAFT,
    });
  }

  async update(id: string, input: Prisma.EventUpdateInput, userId: string) {
    await this.permission.check(id, userId, ['update']);
    return this.repo.update(id, input);
  }

  async updateStatus(id: string, status: EventStatus, userId: string) {
    await this.permission.check(id, userId, ['updateStatus']);
    return this.repo.update(id, { status });
  }

  async remove(id: string, userId: string) {
    await this.permission.check(id, userId, ['delete']);
    await this.repo.delete(id);
    return true;
  }

  private buildFilter(filter?: EventFilter): Prisma.EventWhereInput {
    const where: Prisma.EventWhereInput = {};

    if (!filter) return where;

    if (filter.status) where.status = filter.status;
    if (filter.categoryId) where.categoryId = filter.categoryId;
    if (filter.isPublic !== undefined) where.isPublic = filter.isPublic;

    if (filter.startTimeFrom || filter.startTimeTo) {
      where.startTime = {};

      if (filter.startTimeFrom) {
        where.startTime.gte = filter.startTimeFrom;
      }

      if (filter.startTimeTo) {
        where.startTime.lte = filter.startTimeTo;
      }
    }

    return where;
  }
}
