import { Controller, Get, Logger } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateUserInput, User } from '@boundless/prisma-service';
import {
  createRpcExceptionResponse,
  isRpcExceptionResponse,
} from '@boundless/prisma-service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @MessagePattern('create_user')
  async createUser(data: CreateUserInput): Promise<Omit<User, 'password'>> {
    try {
      if (!data.email || !data.password) {
        throw new RpcException(
          createRpcExceptionResponse({
            status: 'error',
            message: 'Email and password are required',
            httpCode: 400,
          }),
        );
      }

      return await this.appService.createUser(data);
    } catch (error) {
      this.logger.error(`Error in createUser: ${error.message}`, error.stack);

      if (isRpcExceptionResponse(error)) {
        throw new RpcException(error);
      }

      throw new RpcException(
        createRpcExceptionResponse({
          status: 'error',
          message: error.message || 'An unexpected error occurred',
          httpCode: 500,
          originalError: error,
        }),
      );
    }
  }
}
