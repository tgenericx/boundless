import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventStatus, OrganizerRole, Prisma } from '@/generated/prisma';
import { EventFilterInput, PaginationInput } from './dto/event.input';
import { PrismaService } from '@/prisma/prisma.service';
import {
  EventStatus as GQLEventStatus,
  EventCreateInput,
  EventUpdateInput,
} from '@/generated/graphql';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(
    filter?: EventFilterInput,
    pagination?: PaginationInput,
    userId?: string,
  ) {
    const where = this.buildFilter(filter, userId);

    return this.prisma.event.findMany({
      where,
      take: pagination?.take || 20,
      skip: pagination?.skip || 0,
      include: {
        createdBy: true,
        organizers: { include: { user: true } },
        category: true,
        eventMedia: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: true,
        organizers: { include: { user: true } },
        category: true,
        eventMedia: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Draft events are only visible to their creator
    if (event.status === EventStatus.DRAFT && event.userId !== userId) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async findMyEvents(userId: string, role?: OrganizerRole) {
    const where: Prisma.EventWhereInput = {
      OR: [{ userId }, { organizers: { some: { userId } } }],
    };

    if (role) {
      if (role === OrganizerRole.OWNER) {
        where.OR = [{ userId }];
      } else {
        where.OR = [{ userId }, { organizers: { some: { userId, role } } }];
      }
    }

    return this.prisma.event.findMany({
      where,
      include: {
        createdBy: true,
        organizers: { include: { user: true } },
        category: true,
        eventMedia: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async create(input: EventCreateInput, userId: string) {
    if (input.endTime <= input.startTime) {
      throw new BadRequestException('End time must be after start time');
    }
    const inputData = { ...input } as unknown as Prisma.EventCreateInput;

    return this.prisma.event.create({
      data: {
        ...inputData,
        createdBy: {
          connect: {
            id: userId,
          },
        },
        status: EventStatus.DRAFT,
      },
      include: {
        createdBy: true,
        organizers: { include: { user: true } },
        category: true,
        eventMedia: true,
      },
    });
  }

  async update(id: string, input: EventUpdateInput, userId: string) {
    await this.checkPermission(id, userId, ['update']);

    if (input.startTime && input.endTime) {
      if (input.endTime <= input.startTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    const data = { ...input } as unknown as Prisma.EventUpdateInput;

    return this.prisma.event.update({
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

  async updateStatus(id: string, status: EventStatus, userId: string) {
    await this.checkPermission(id, userId, ['updateStatus']);

    return this.prisma.event.update({
      where: { id },
      data: { status },
      include: {
        createdBy: true,
        organizers: { include: { user: true } },
        category: true,
        eventMedia: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { eventMedia: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (event.userId !== userId) {
      throw new UnauthorizedException(
        'Only event creator can delete the event',
      );
    }

    try {
      const deletePromises = event.eventMedia.map((m) =>
        this.cloudinaryService.deleteFile(m.publicId).catch((err) => {
          console.error(
            `Failed to delete Cloudinary media: ${m.publicId}`,
            err,
          );
          return null;
        }),
      );

      await Promise.all(deletePromises);
    } catch (err) {
      console.error(
        'Failed to delete associated media. Aborting event deletion.',
        err,
      );
      throw new InternalServerErrorException(
        'Failed to delete associated media.',
      );
    }

    await this.prisma.event.delete({ where: { id } });
    return true;
  }

  async addOrganizer(
    eventId: string,
    targetUserId: string,
    role: OrganizerRole,
    currentUserId: string,
  ) {
    await this.checkPermission(eventId, currentUserId, ['manageOrganizers']);

    if (role === OrganizerRole.OWNER) {
      throw new BadRequestException(
        'Cannot add additional OWNER. Only event creator is OWNER.',
      );
    }

    const existing = await this.prisma.eventOrganizer.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: targetUserId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'User is already an organizer for this event',
      );
    }

    return this.prisma.eventOrganizer.create({
      data: {
        eventId,
        userId: targetUserId,
        role,
        addedById: currentUserId,
      },
      include: {
        user: true,
        event: true,
      },
    });
  }

  async removeOrganizer(
    eventId: string,
    targetUserId: string,
    currentUserId: string,
  ) {
    const isSelf = currentUserId === targetUserId;

    if (!isSelf) {
      await this.checkPermission(eventId, currentUserId, ['manageOrganizers']);
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (event?.userId === targetUserId) {
      throw new BadRequestException('Cannot remove event creator');
    }

    const result = await this.prisma.eventOrganizer.deleteMany({
      where: { eventId, userId: targetUserId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Organizer not found for this event');
    }

    return true;
  }

  private async checkPermission(
    eventId: string,
    userId: string,
    requiredActions: string[],
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: {
          where: { userId },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const isCreator = event.userId === userId;
    const organizer = event.organizers[0];

    const permissions = {
      update:
        isCreator ||
        organizer?.role === OrganizerRole.CO_ORGANIZER ||
        organizer?.role === OrganizerRole.CONTRIBUTOR,
      manageOrganizers:
        isCreator || organizer?.role === OrganizerRole.CO_ORGANIZER,
      delete: isCreator,
      updateStatus: isCreator || organizer?.role === OrganizerRole.CO_ORGANIZER,
    };

    for (const action of requiredActions) {
      if (!permissions[action]) {
        throw new UnauthorizedException(
          `No permission to ${action} this event`,
        );
      }
    }
  }

  private buildFilter(
    filter?: EventFilterInput,
    userId?: string,
  ): Prisma.EventWhereInput {
    const where: Prisma.EventWhereInput = {};

    // Exclude drafts unless viewing your own
    if (userId) {
      where.OR = [
        { status: { not: EventStatus.DRAFT } },
        { userId, status: EventStatus.DRAFT },
      ];
    } else {
      // Anonymous users never see drafts
      where.status = { not: EventStatus.DRAFT };
    }

    if (!filter) return where;

    if (filter.status) {
      // If user explicitly filters by DRAFT, they should only see their own
      if (filter.status === GQLEventStatus.DRAFT) {
        if (userId) {
          where.AND = [{ status: EventStatus.DRAFT }, { userId }];
          delete where.OR;
        } else {
          // Anonymous users requesting drafts get empty results
          where.id = 'impossible-id';
        }
      } else {
        where.status = filter.status;
      }
    }

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
