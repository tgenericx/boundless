import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ConsoleLogger, Logger } from '@nestjs/common';
import { ExceptionFilter } from '@boundless/errors';

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
  app.useGlobalFilters(new ExceptionFilter());
  app.enableShutdownHooks();

  await app.listen(PORT);

  logger.log(`✅ Auth service started`);
  logger.log(`🌱 Env: ${config.get('NODE_ENV')}`);
  logger.log(`🚑 Health: http://localhost:${PORT}/${globalPrefix}/health`);
}
bootstrap().catch((err) => {
  Logger.error('❌ Failed to bootstrap Auth microservice', err);
  process.exit(1);
});
