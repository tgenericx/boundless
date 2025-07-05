import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateUserInput, User } from '@boundless/prisma-service';
import { Omit } from '@prisma/client/runtime/library';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @MessagePattern('create_user')
  async createUser(data: CreateUserInput): Promise<Omit<User, 'password'>> {
    return this.appService.createUser(data);
  }
}
