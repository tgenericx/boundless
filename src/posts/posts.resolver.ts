import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';

/**
 * GraphQL resolver for post operations
 */
@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Retrieves all posts
   * @returns Promise resolving to an array of posts
   */
  @Query(() => [Post], { name: 'posts', description: 'Get all posts' })
  findAll() {
    return this.postsService.findAll();
  }

  /**
   * Creates a new post
   * @param input - Data for the new post
   * @returns Promise resolving to the created post
   */
  @Mutation(() => Post, { description: 'Create a new post' })
  createPost(@Args('input') input: CreatePostInput) {
    return this.postsService.create(input);
  }

  /**
   * Deletes a post by ID
   * @param id - ID of the post to delete
   * @returns Promise resolving to boolean indicating success
   */
  @Mutation(() => Boolean, { description: 'Delete a post by ID' })
  deletePost(@Args('id') id: string) {
    return this.postsService.delete(id);
  }
}
