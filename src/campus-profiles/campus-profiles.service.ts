import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@/generated/prisma';

@Injectable()
export class CampusProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.CampusProfileCreateArgs) {
    return this.prisma.campusProfile.create(args);
  }

  async findAll(args?: Prisma.CampusProfileFindManyArgs) {
    return this.prisma.campusProfile.findMany(args);
  }

  async findOne(args: Prisma.CampusProfileFindUniqueArgs) {
    return this.prisma.campusProfile.findUnique(args);
  }

  async update(args: Prisma.CampusProfileUpdateArgs) {
    return this.prisma.campusProfile.update(args);
  }

  async remove(args: Prisma.CampusProfileDeleteArgs) {
    return this.prisma.campusProfile.delete(args);
  }

  async findByUser(userId: string) {
    return this.prisma.campusProfile.findUnique({
      where: { userId },
      include: {
        faculty: true,
        department: true,
      },
    });
  }
}
