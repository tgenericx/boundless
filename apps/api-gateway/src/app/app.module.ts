import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
            logger: console,
            urls: [
              configService.get<string>(
                'RABBITMQ_URL',
                'amqps://guest:guest@localhost:5672',
              ),
            ],
            queue: configService.get<string>('AUTH_QUEUE', 'auth_queue'),
            queueOptions: {
              durable: false,
              noAck: false,
              prefetchCount: 1,
            },
            socketOptions: {
              heartbeat: 30,
            },
          },
        }),
      },
    ]),
    GqlModule,
  ],
  providers: [AppService, AppResolver],
})
export class AppModule {}
