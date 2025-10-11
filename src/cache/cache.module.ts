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
        const redisUrl: string =
          config.get('REDIS_URL') ||
          `redis://${config.get('REDIS_HOST') || 'localhost'}:${
            config.get('REDIS_PORT') || 6379
          }`;

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
})
export class CacheConfigModule {}
