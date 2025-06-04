import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service that provides access to the Prisma ORM
 * @extends PrismaClient
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Connects to the database when the module initializes
   */
  async onModuleInit() {
    await this.$connect();
  }
}
