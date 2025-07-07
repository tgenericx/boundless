import { Prisma, PrismaService, User } from '@boundless/prisma-service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Omit } from '@prisma/client/runtime/library';
import * as argon2 from 'argon2';
import { createRpcExceptionResponse } from '@boundless/prisma-service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async createUser(
    data: Prisma.UserCreateInput,
  ): Promise<Omit<User, 'password'>> {
    try {
      const password = await argon2.hash(data.password);
      return await this.prisma.user.create({
        data: {
          ...data,
          password,
        },
      });
    } catch (error) {
      this.logger.error(`Error in createUser: ${error.message}`, error.stack);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target?.[0];
          throw new RpcException(
            createRpcExceptionResponse({
              status: 'error',
              message: `User with this ${field} already exists`,
              code: error.code,
              httpCode: HttpStatus.CONFLICT,
              metadata: error.meta,
              originalError: error,
            }),
          );
        }
      }

      throw new RpcException(
        createRpcExceptionResponse({
          status: 'error',
          message: error.message || 'Failed to create user',
          httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
          originalError: error,
        }),
      );
    }
  }
}
