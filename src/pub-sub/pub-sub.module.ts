import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PUB_SUB',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const username = config.get<string>('REDIS_USERNAME', '');
        const password = config.get<string>('REDIS_PASSWORD', '');
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = config.get<number>('REDIS_PORT', 6379);
        const env = config.get<string>('NODE_ENV', 'development').toLowerCase();

        const redisUrl =
          env === 'development'
            ? `redis://${host}:${port}`
            : `redis://${username}:${password}@${host}:${port}`;

        const options = {
          retryStrategy: (times: number) => Math.min(times * 50, 2000),
        };

        const publisher = new Redis(redisUrl, options);
        const subscriber = new Redis(redisUrl, options);

        return new RedisPubSub({
          publisher,
          subscriber,
        });
      },
    },
  ],
  exports: ['PUB_SUB'],
})
export class PubSubModule {}
