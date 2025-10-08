import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Business, Prisma } from 'generated/prisma';

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.BusinessCreateArgs): Promise<Business> {
    return this.prisma.business.create(args);
  }

  async findOne(args: Prisma.BusinessFindUniqueArgs): Promise<Business | null> {
    return this.prisma.business.findUnique(args);
  }

  async findMany(args?: Prisma.BusinessFindManyArgs): Promise<Business[]> {
    return this.prisma.business.findMany(args);
  }

  async update(args: Prisma.BusinessUpdateArgs): Promise<Business> {
    try {
      return await this.prisma.business.update(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Business not found');
      }
      throw error;
    }
  }

  async remove(args: Prisma.BusinessDeleteArgs): Promise<Business> {
    try {
      return await this.prisma.business.delete(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Business not found');
      }
      throw error;
    }
  }
}
