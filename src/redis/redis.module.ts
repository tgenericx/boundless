import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis, { RedisOptions } from 'ioredis';
import { Queue, QueueEvents } from 'bullmq';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger(RedisModule.name);
        const redisOptions: RedisOptions = {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          username: config.get<string>('REDIS_USERNAME') || undefined,
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          tls: config.get<boolean>('REDIS_TLS_ENABLED', false) ? {} : undefined,
          maxRetriesPerRequest: null,
        };

        const client = new IORedis(redisOptions);

        client.on('connect', () => {
          logger.log(
            `✅ Redis connected at ${redisOptions.host}:${redisOptions.port}`,
          );
        });

        client.on('ready', () => {
          logger.log('🚀 Redis is ready to receive commands');
        });

        client.on('reconnecting', () => {
          logger.warn('♻️ Redis is reconnecting...');
        });

        client.on('end', () => {
          logger.warn('⚠️ Redis connection closed');
        });

        client.on('error', (err) => {
          logger.error(`❌ Redis error: ${err.message}`, err.stack);
        });

        return client;
      },
    },

    {
      provide: 'FEED_QUEUE',
      inject: ['REDIS_CLIENT'],
      useFactory: (redis: IORedis) => {
        const logger = new Logger(RedisModule.name);
        logger.log('🪣 Initializing feed queue...');
        return new Queue('feed', { connection: redis });
      },
    },

    {
      provide: 'FEED_QUEUE_EVENTS',
      inject: ['REDIS_CLIENT'],
      useFactory: (redis: IORedis) => {
        const logger = new Logger(RedisModule.name);
        logger.log('📡 Subscribing to feed queue events...');
        return new QueueEvents('feed', { connection: redis });
      },
    },
  ],
  exports: ['REDIS_CLIENT', 'FEED_QUEUE', 'FEED_QUEUE_EVENTS'],
})
export class RedisModule {}
