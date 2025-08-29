import { Module } from '@nestjs/common';
import { SchedulesResolver } from './schedules.resolver';
import { SchedulesService } from './schedules.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [SchedulesResolver, SchedulesService, PrismaService],
})
export class SchedulesModule {}
