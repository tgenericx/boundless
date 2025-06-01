import { Injectable } from '@nestjs/common';
import { Post } from './entities/post.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreatePostInput } from './dto/create-post.input';

/**
 * Service for managing posts
 */
@Injectable()
export class PostsService {
  private posts: Post[] = [];

  /**
   * Retrieves all posts
   * @returns Array of all posts
   */
  findAll(): Post[] {
    return this.posts;
  }

  /**
   * Creates a new post
   * @param input - Data for the new post
   * @returns The newly created post
   */
  create(input: CreatePostInput): Post {
    const newPost: Post = {
      id: uuidv4(),
      textContent: input.textContent,
      mediaUrls: input.mediaUrls,
      createdAt: new Date().toISOString(),
    };

    this.posts.push(newPost);
    return newPost;
  }

  /**
   * Deletes a post by ID
   * @param id - ID of the post to delete
   * @returns true if the post was deleted, false if not found
   */
  delete(id: string): boolean {
    const initialLength = this.posts.length;
    this.posts = this.posts.filter((post) => post.id !== id);
    return this.posts.length !== initialLength;
  }
}
