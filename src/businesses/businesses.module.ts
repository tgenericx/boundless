import { Module } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { BusinessesResolver } from './businesses.resolver';

@Module({
  providers: [BusinessesResolver, BusinessesService],
})
export class BusinessesModule {}
