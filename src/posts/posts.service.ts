import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Post, Prisma } from '@prisma/client';
import { BaseService } from '../common/base.service';

/**
 * Service for managing Post entities.
 */
@Injectable()
export class PostsService extends BaseService<
  Post,
  Prisma.PostCreateInput,
  Prisma.PostUpdateInput
> {
  /**
   * @param prismaService - The Prisma service injected by NestJS DI
   */
  constructor(protected readonly prismaService: PrismaService) {
    super(prismaService);
  }

  /**
   * Provides the Prisma delegate for the Post model.
   */
  protected get prismaDelegate() {
    return this.prismaService.post;
  }

  /**
   * Creates a new Post entity.
   *
   * @param data - Data used to create the Post
   * @returns A promise that resolves with the created Post
   */
  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return await this.prismaDelegate.create({
      data,
    });
  }

  /**
   * Retrieves all Post entities.
   *
   * @param args - Optional Prisma query arguments
   * @returns A promise that resolves with an array of Posts
   */
  async findAll(args: Prisma.PostFindManyArgs = {}): Promise<Post[]> {
    return await this.prismaDelegate.findMany({
      ...args,
    });
  }

  /**
   * Updates a Post entity.
   *
   * @param data - Data used to update the Post (must include `id`)
   * @returns A promise that resolves with the updated Post
   */
  async update(data: Prisma.PostUpdateInput & { id: string }): Promise<Post> {
    const { id, ...rest } = data;
    return await this.prismaDelegate.update({
      where: { id },
      data: rest,
    });
  }
}
