import { CacheService } from '@/cache/cache.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('cache')
export class CacheTestController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('set')
  async set(@Query('key') key: string, @Query('value') value: string) {
    await this.cacheService.set(key, value, '2m'); // TTL 2 minutes
    return { message: `Set key "${key}"`, value };
  }

  @Get('get')
  async get(@Query('key') key: string) {
    const value = await this.cacheService.get(key);
    return { key, value };
  }

  @Get('delete')
  async delete(@Query('key') key: string) {
    await this.cacheService.delete(key);
    return { message: `Deleted key "${key}"` };
  }
}
