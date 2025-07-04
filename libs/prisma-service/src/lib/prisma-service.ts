import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient, Prisma } from './@generated/prisma/client';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });

    this.$extends(withAccelerate());
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Prisma connected successfully');
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('✅ Prisma disconnected');
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      let message = error.message;
      let userMessage = 'An error occurred. Please try again.';

      switch (error.code) {
        case 'P2002':
          const violatedField = this.extractFieldFromErrorMessage(error.message);
          this.logger.error(`❌ Unique constraint violation: ${error.message}`);
          userMessage = `The ${violatedField} already exists. Please try again with a different value.`;
          throw new BadRequestException(userMessage, message); // Provide original error as additional context

        case 'P2003': // Foreign key constraint violation
          this.logger.error(`❌ Foreign key violation: ${error.message}`);
          userMessage = 'Related record not found. Please ensure related data is valid.';
          throw new BadRequestException(userMessage, message);

        case 'P2025':
          this.logger.error(`❌ Record not found: ${error.message}`);
          userMessage = 'The requested record could not be found. Please check your input.';
          throw new NotFoundException(userMessage, message);

        case 'P2026':
          this.logger.error(`❌ Too many records returned: ${error.message}`);
          userMessage = 'Multiple records returned when only one was expected. Please verify your query.';
          throw new InternalServerErrorException(userMessage, message);

        default:
          this.logger.error(`❌ Prisma error (Known): ${error.message}`);
          userMessage = 'An unexpected error occurred. Please try again later.';
          throw new InternalServerErrorException(userMessage, message);
      }
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      this.logger.error(`❌ Unknown Prisma error: ${error.message}`);
      throw new InternalServerErrorException('Unknown issue with the database connection.', error.message);
    } else {
      this.logger.error(`❌ General Prisma error: ${error}`);
      throw new InternalServerErrorException('Unexpected error occurred. Please try again later.', error);
    }
  }

  private extractFieldFromErrorMessage(errorMessage: string): string {
    const match = errorMessage.match(/Unique constraint failed on the fields: \[(.*)\]/);
    return match ? match[1] : 'Unknown field';
  }
}
