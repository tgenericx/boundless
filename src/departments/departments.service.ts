import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@/generated/prisma';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.DepartmentCreateArgs) {
    return this.prisma.department.create(args);
  }

  async findAll(args?: Prisma.DepartmentFindManyArgs) {
    return this.prisma.department.findMany(args);
  }

  async findOne(args: Prisma.DepartmentFindUniqueArgs) {
    return this.prisma.department.findUnique(args);
  }

  async update(args: Prisma.DepartmentUpdateArgs) {
    return this.prisma.department.update(args);
  }

  async remove(args: Prisma.DepartmentDeleteArgs) {
    return this.prisma.department.delete(args);
  }
}
