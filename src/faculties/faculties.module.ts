import { Module } from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { FacultiesResolver } from './faculties.resolver';

@Module({
  providers: [FacultiesResolver, FacultiesService],
})
export class FacultiesModule {}
