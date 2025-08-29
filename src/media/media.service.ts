import { Injectable, NotFoundException } from '@nestjs/common';
import { Media, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.MediaCreateArgs): Promise<Media> {
    return this.prisma.media.create(args);
  }

  async findOne(args: Prisma.MediaFindUniqueArgs): Promise<Media> {
    const media = await this.prisma.media.findUnique(args);

    if (!media) {
      throw new NotFoundException(`Media not found`);
    }

    return media;
  }

  async update(args: Prisma.MediaUpdateArgs): Promise<Media> {
    try {
      return await this.prisma.media.update(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Media not found`);
      }
      throw error;
    }
  }

  async remove(args: Prisma.MediaDeleteArgs): Promise<Media> {
    try {
      return await this.prisma.media.delete(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Media not found`);
      }
      throw error;
    }
  }

  async findMany(args?: Prisma.MediaFindManyArgs): Promise<Media[]> {
    return this.prisma.media.findMany(args);
  }
}
