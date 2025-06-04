import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';

/**
 * Service for managing social media posts
 *
 * @description Handles all business logic related to post creation, retrieval, and deletion
 */
@Injectable()
export class PostsService {
  /**
   * Creates an instance of PostsService
   * @param prisma - The Prisma service for database access
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all posts from the database
   * @async
   * @returns {Promise<Post[]>} Array of posts sorted by creation date (newest first)
   */
  async findAll(): Promise<Post[]> {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Creates a new post in the database
   * @async
   * @param {CreatePostInput} input - Data for the new post
   * @returns {Promise<Post>} The newly created post
   */
  async create(input: CreatePostInput): Promise<Post> {
    return this.prisma.post.create({
      data: {
        textContent: input.textContent,
        mediaUrls: input.mediaUrls || [],
      },
    });
  }

  /**
   * Deletes a post by its ID
   * @async
   * @param {string} id - The ID of the post to delete
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.post.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves posts with pagination
   * @async
   * @param {number} skip - Number of posts to skip
   * @param {number} take - Number of posts to take
   * @returns {Promise<Post[]>} Paginated array of posts
   */
  async findPaginated(skip: number, take: number): Promise<Post[]> {
    return this.prisma.post.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}
