import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { GqlModule } from '../gql/gql.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL', 'amqps://...'), // Env variable with fallback
            ],
            queue: configService.get<string>('AUTH_QUEUE', 'auth_queue'), // Using the default 'auth_queue'
            queueOptions: { durable: false },
          },
        }),
      },
    ]),
    GqlModule
  ],
  providers: [AppService, AppResolver],
})
export class AppModule { }
