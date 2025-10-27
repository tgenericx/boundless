import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@/generated/prisma';

@Injectable()
export class FacultiesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(args: Prisma.FacultyCreateArgs) {
    return await this.prisma.faculty.create(args);
  }

  async findAll(args?: Prisma.FacultyFindManyArgs) {
    return await this.prisma.faculty.findMany(args);
  }

  async findOne(args: Prisma.FacultyFindUniqueArgs) {
    return await this.prisma.faculty.findUnique(args);
  }

  async update(args: Prisma.FacultyUpdateArgs) {
    return await this.prisma.faculty.update(args);
  }

  async remove(args: Prisma.FacultyDeleteArgs) {
    return this.prisma.faculty.delete(args);
  }
}
