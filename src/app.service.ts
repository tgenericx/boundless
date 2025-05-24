import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private message: string = 'Hello World!';
  getHello(): {
    message: string;
  } {
    return {
      message: this.message,
    };
  }
}
