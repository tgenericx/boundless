import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { ExchangeRegistry } from '@boundless/utils';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const authExchanges = ExchangeRegistry.auth;

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
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}
