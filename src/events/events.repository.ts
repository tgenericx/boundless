import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@/generated/prisma';
import { ArgsType } from '@nestjs/graphql';

@ArgsType()
export class Pagination {
  take?: number;
  skip?: number;
}

@Injectable()
export class EventRepository {
  constructor(private prisma: PrismaService) {}

  async findManyEvents(
    where: Prisma.EventWhereInput,
    pagination: Pagination = {},
  ) {
    return await this.prisma.event.findMany({
      where,
      take: pagination.take ?? 20,
      skip: pagination.skip ?? 0,
      include: {
        createdBy: true,
        organizers: { include: { user: true } },
        category: true,
        eventMedia: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findById(id: string) {
    return await this.prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: true,
        organizers: { include: { user: true } },
        category: true,
        eventMedia: true,
      },
    });
  }

  async create(data: Prisma.EventCreateInput) {
    return await this.prisma.event.create({
      data,
      include: {
        createdBy: true,
        organizers: { include: { user: true } },
        category: true,
        eventMedia: true,
      },
    });
  }

  async update(
    id: Prisma.EventWhereUniqueInput['id'],
    data: Prisma.EventUpdateInput,
  ) {
    return await this.prisma.event.update({
      where: { id },
      data,
      include: {
        createdBy: true,
        organizers: { include: { user: true } },
        category: true,
        eventMedia: true,
      },
    });
  }

  async delete(id: Prisma.EventWhereUniqueInput['id']) {
    return await this.prisma.event.delete({ where: { id } });
  }
}
