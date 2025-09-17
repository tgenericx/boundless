import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMailerOptions(): MailerOptions {
    return {
      transport: {
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        auth: {
          user: this.configService.get<string>('SMTP_USERNAME'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
      },
      defaults: {
        from: `"No Reply" <${this.configService.get<string>('SMTP_FROM')}>`,
      },
    };
  }
}
