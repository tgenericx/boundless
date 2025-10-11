import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheableMemory } from 'cacheable';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
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

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({
                ttl: 1000 * 60 * 5,
                lruSize: 5000,
              }),
            }),

            new KeyvRedis(redisUrl),
          ],
          ttl: 1000 * 60 * 10,
          max: 10000,
        };
      },
    }),
  ],
  exports: [ 'CacheModule' ]
})
export class CacheConfigModule {}
