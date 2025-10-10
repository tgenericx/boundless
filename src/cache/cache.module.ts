import { Module, Global } from '@nestjs/common';
import { Cacheable } from 'cacheable';
import KeyvRedis from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CACHE_INSTANCE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl: string =
          config.get('REDIS_URL') ||
          `redis://${config.get('REDIS_HOST') || 'localhost'}:${
            config.get('REDIS_PORT') || 6379
          }`;

        const secondary = new KeyvRedis(redisUrl);

        return new Cacheable({ secondary, ttl: '4h' });
      },
    },
    CacheService,
  ],
  exports: ['CACHE_INSTANCE', CacheService],
})
export class CacheModule {}
