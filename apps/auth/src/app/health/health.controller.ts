import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MicroserviceHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '@boundless/prisma-service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaIndicator: PrismaHealthIndicator,
    private microserviceIndicator: MicroserviceHealthIndicator,
    private configService: ConfigService,
    private prisma: PrismaService,
    private readonly disk: DiskHealthIndicator,
  ) {}

  private readonly healthCheckTimeout = this.configService.get<number>(
    'HEALTH_CHECK_TIMEOUT',
    2000,
  );

  @Get()
  @HealthCheck()
  async check() {
    return await this.health.check([
      async () =>
        await this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.5,
        }),
      async () =>
        await this.prismaIndicator.pingCheck('database', this.prisma, {
          timeout: this.healthCheckTimeout,
        }),
      async () =>
        await this.microserviceIndicator.pingCheck<RmqOptions>('rabbitmq', {
          timeout: this.healthCheckTimeout,
          transport: Transport.RMQ,
          options: {
            urls: [
              this.configService.get<string>(
                'RABBITMQ_URL',
                'amqps://guest:guest@localhost:5672',
              ),
            ],
            queue: this.configService.get<string>('AUTH_QUEUE', 'auth_queue'),
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
    ]);
  }
}
