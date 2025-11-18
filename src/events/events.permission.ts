import { OrganizerRole } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class EventPermission {
  constructor(private prisma: PrismaService) {}

  async check(eventId: string, userId: string, actions: string[]) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizers: { where: { userId } },
      },
    });

    if (!event) throw new Error('Event not found');

    const isCreator = event.userId === userId;
    const organizer = event.organizers[0];

    const can = {
      update: isCreator || organizer?.role === OrganizerRole.CO_ORGANIZER,
      updateStatus: isCreator || organizer?.role === OrganizerRole.CO_ORGANIZER,
      manageOrganizers:
        isCreator || organizer?.role === OrganizerRole.CO_ORGANIZER,
      delete: isCreator,
    };

    for (const action of actions) {
      if (!can[action]) {
        throw new UnauthorizedException(`Not allowed to ${action}`);
      }
    }
  }
}
