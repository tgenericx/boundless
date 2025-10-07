import { Injectable } from '@nestjs/common';
import { AbstractOwnerGuard } from 'src/utils/guards/abstract-owner.guard';
import type { IdArgs } from 'src/types';
import { PostsService } from 'src/posts/posts.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostOwnerGuard extends AbstractOwnerGuard<IdArgs, [Post]> {
  constructor(private readonly postsService: PostsService) {
    super([
      {
        resourceName: 'Post',
        ownerField: 'userId',
        findResourceById: (id: string) =>
          postsService.findOne({ where: { id } }),
      },
    ]);
  }
}
