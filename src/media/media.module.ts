import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaResolver } from './media.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [MediaResolver, MediaService, PrismaService],
})
export class MediaModule {}
