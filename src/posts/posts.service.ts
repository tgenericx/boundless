import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { FeedService } from '@/feed/feed.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly feedService: FeedService,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    const post = await this.prisma.post.create({ data });
    await this.feedService
      .fanOutPost({
        id: post.id,
        authorId: post.userId,
      })
      .catch(console.error);
    return post;
  }

  async findOne(args: Prisma.PostFindUniqueArgs): Promise<Post> {
    const post = await this.prisma.post.findUnique(args);

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    return post;
  }

  async update(args: Prisma.PostUpdateArgs): Promise<Post> {
    try {
      return await this.prisma.post.update(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Post not found`);
      }
      throw error;
    }
  }

  async remove(args: Prisma.PostDeleteArgs): Promise<Post> {
    try {
      return await this.prisma.post.delete(args);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Post not found`);
      }
      throw error;
    }
  }

  async findMany(args?: Prisma.PostFindManyArgs): Promise<Post[]> {
    return this.prisma.post.findMany(args);
  }
}
