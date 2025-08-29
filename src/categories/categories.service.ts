import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.CategoryCreateArgs): Promise<Category> {
    return this.prisma.category.create(args);
  }

  async findOne(args: Prisma.CategoryFindUniqueArgs): Promise<Category> {
    const category = await this.prisma.category.findUnique(args);

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    return category;
  }

  async update(args: Prisma.CategoryUpdateArgs): Promise<Category> {
    try {
      return await this.prisma.category.update(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Category not found`);
      }
      throw error;
    }
  }

  async remove(args: Prisma.CategoryDeleteArgs): Promise<Category> {
    try {
      return await this.prisma.category.delete(args);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Category not found`);
        }
      }
      throw error;
    }
  }

  async findMany(args?: Prisma.CategoryFindManyArgs): Promise<Category[]> {
    return this.prisma.category.findMany(args);
  }
}
