import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Event } from 'generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.EventCreateArgs) {
    const { startTime, endTime } = args.data;
    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }
    return this.prisma.event.create(args);
  }

  async findOne(args: Prisma.EventFindUniqueArgs): Promise<Event> {
    const event = await this.prisma.event.findUnique(args);
    if (!event) throw new NotFoundException(`Event not found`);
    return event;
  }

  async findMany(args?: Prisma.EventFindManyArgs): Promise<Event[]> {
    return this.prisma.event.findMany(args);
  }

  async update(args: Prisma.EventUpdateArgs): Promise<Event> {
    try {
      return await this.prisma.event.update(args);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025')
          throw new NotFoundException(`Event not found`);
      }
      throw error;
    }
  }

  async remove(args: Prisma.EventDeleteArgs): Promise<Event> {
    try {
      return await this.prisma.event.delete(args);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025')
          throw new NotFoundException(`Event not found`);
      }
      throw error;
    }
  }
}
