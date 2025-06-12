import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Subscription,
} from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

/**
 * Resolver for GraphQL operations related to Posts.
 */
@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postService: PostsService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  /**
   * Creates a new Post.
   *
   * @param input - Input data for the new Post
   * @returns The created Post
   */
  @Mutation(() => Post, {
    name: 'createPost',
    description: 'Creates a new post with the provided input data.',
  })
  async createPost(@Args('input') input: CreatePostInput): Promise<Post> {
    return this.postService.create(input);
  }

  /**
   * subscription that emits an event when a new post is created.
   *
   * @returns An async iterator that can be used to listen for 'postCreated' events
   */
  @Subscription(() => Post, {
    name: 'postCreated',
    description: 'Triggers when a new post is created',
  })
  postCreated() {
    return this.pubSub.asyncIterableIterator('postCreated');
  }

  /**
   * Retrieves all Posts.
   *
   * @returns An array of all Posts
   */
  @Query(() => [Post], {
    name: 'posts',
    description: 'Returns all posts in the system.',
  })
  async findAllPosts(): Promise<Post[]> {
    return this.postService.findAll();
  }

  /**
   * Retrieves a single Post by its ID.
   *
   * @param id - The ID of the Post
   * @returns The Post with the specified ID
   */
  @Query(() => Post, {
    name: 'post',
    nullable: true,
    description: 'Returns a single post identified by its unique ID.',
  })
  async findPostById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Post | null> {
    return this.postService.findUnique({ id });
  }

  /**
   * Updates an existing Post.
   *
   * @param input - Updated data for the Post, including ID
   * @returns The updated Post
   */
  @Mutation(() => Post, {
    name: 'updatePost',
    description: 'Updates an existing post with the provided data.',
  })
  async updatePost(@Args('input') input: UpdatePostInput): Promise<Post> {
    return this.postService.update({ where: { id: input.id }, data: input });
  }

  /**
   * Deletes a Post by its ID.
   *
   * @param id - The ID of the Post to delete
   * @returns The deleted Post
   */
  @Mutation(() => Post, {
    name: 'deletePost',
    description: 'Deletes a post identified by its unique ID.',
  })
  async deletePost(@Args('id', { type: () => ID }) id: string): Promise<Post> {
    return this.postService.delete({ id });
  }
}
