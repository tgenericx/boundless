import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ConsoleLogger, Logger } from '@nestjs/common';
import {
  TransportExceptionFilter,
  TransportResponseInterceptor,
} from '@boundless/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: true,
    }),
  });

  const config = app.get(ConfigService);
  const logger = new Logger('AuthBootstrap');
  const PORT = config.get<number>('PORT', 3001);
  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalInterceptors(new TransportResponseInterceptor());
  app.useGlobalFilters(new TransportExceptionFilter());
  app.enableShutdownHooks();

  await app.listen(PORT);

  logger.log(`✅ Auth service started`);
  logger.log(`🌱 Env: ${config.get<string>('NODE_ENV', 'development')}`);
  logger.log(`🚑 Health: http://localhost:${PORT}/${globalPrefix}/health`);
}
bootstrap().catch((err) => {
  Logger.error('❌ Failed to bootstrap Auth microservice', err);
  process.exit(1);
});
