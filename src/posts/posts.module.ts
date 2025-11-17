import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { FeedModule } from '@/feed/feed.module';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';

@Module({
  imports: [FeedModule, CloudinaryModule],
  providers: [PostsResolver, PostsService],
  exports: [PostsService],
})
export class PostsModule {}
