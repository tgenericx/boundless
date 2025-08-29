import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ScheduleItem } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.ScheduleItemCreateArgs) {
    const { startTime, endTime } = args.data;
    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }
    return this.prisma.scheduleItem.create(args);
  }

  async findOne(
    args: Prisma.ScheduleItemFindUniqueArgs,
  ): Promise<ScheduleItem> {
    const schedule = await this.prisma.scheduleItem.findUnique(args);
    if (!schedule) throw new NotFoundException(`Schedule not found`);
    return schedule;
  }

  async findMany(
    args?: Prisma.ScheduleItemFindManyArgs,
  ): Promise<ScheduleItem[]> {
    return this.prisma.scheduleItem.findMany(args);
  }

  async update(args: Prisma.ScheduleItemUpdateArgs): Promise<ScheduleItem> {
    try {
      return await this.prisma.scheduleItem.update(args);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025')
          throw new NotFoundException(`Schedule not found`);
      }
      throw error;
    }
  }

  async remove(args: Prisma.ScheduleItemDeleteArgs): Promise<ScheduleItem> {
    try {
      return await this.prisma.scheduleItem.delete(args);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025')
          throw new NotFoundException(`Schedule not found`);
      }
      throw error;
    }
  }
}
