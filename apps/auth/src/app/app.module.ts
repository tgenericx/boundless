import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '@boundless/types/prisma';
import { JwtModule } from '@nestjs/jwt';
import { HealthModule } from './health/health.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Exchanges } from '@boundless/types/amqp';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'super-secret-key'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
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
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
