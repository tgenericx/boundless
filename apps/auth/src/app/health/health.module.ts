import { Module } from '@nestjs/common';
import { PrismaHealthIndicator, TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { MicroserviceHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '@boundless/db-prisma';

@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),
  ],
  controllers: [HealthController],
  providers: [
    PrismaHealthIndicator,
    MicroserviceHealthIndicator,
    PrismaService,
  ],
})
export class HealthModule {}
