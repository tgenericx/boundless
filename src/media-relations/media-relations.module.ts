import { Module } from '@nestjs/common';
import { MediaRelationsService } from './media-relations.service';
import { MediaRelationsResolver } from './media-relations.resolver';

@Module({
  providers: [MediaRelationsResolver, MediaRelationsService],
})
export class MediaRelationsModule {}
