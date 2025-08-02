import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { TokensModule } from '../tokens/tokens.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { ExchangeRegistry } from '@boundless/utils';

@Module({
  imports: [
    UsersModule,
    TokensModule,
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
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
