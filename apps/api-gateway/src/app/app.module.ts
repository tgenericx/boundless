import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GqlModule } from '../gql/gql.module';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Exchanges } from '@boundless/utils';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GqlModule,
    RabbitMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const authExchanges = Exchanges.auth;

        return {
          uri: config.get<string>(
            'RABBITMQ_URL',
            'amqp://guest:guest@localhost:5672',
          ),
          enableControllerDiscovery: true,
          connectionInitOptions: {
            wait: true,
            reject: true,
            timeout: 10000,
          },
          exchanges: Object.values(authExchanges).map((ex) => ({
            name: ex.name,
            type: ex.type,
            options: {
              durable: true,
            },
          })),
        };
      },
    }),
  ],
  providers: [AppService, AppResolver],
})
export class AppModule {}
