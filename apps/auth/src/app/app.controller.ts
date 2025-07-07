import { Controller, Get, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateUserInput, User } from '@boundless/prisma-service';

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
    return await this.appService.createUser(data);
  }
}
