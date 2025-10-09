import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsResolver } from './listings.resolver';

@Module({
  providers: [ListingsResolver, ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
