import { Injectable } from '@nestjs/common';
import { Post } from './entities/post.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostsService {
  private posts: Post[] = [];

  findAll(): Post[] {
    return this.posts;
  }

  create(input: { title: string; content: string }): Post {
    const newPost: Post = {
      id: uuidv4(),
      title: input.title,
      content: input.content,
      createdAt: new Date().toISOString(),
    };
    this.posts.push(newPost);
    return newPost;
  }

  delete(id: string): boolean {
    const initialLength = this.posts.length;
    this.posts = this.posts.filter(post => post.id !== id);
    return this.posts.length !== initialLength;
  }
}
