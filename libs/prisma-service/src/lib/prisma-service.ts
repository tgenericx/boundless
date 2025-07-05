import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from './@generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
    this.$extends(withAccelerate());
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Prisma connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('✅ Prisma disconnected');
  }
}
