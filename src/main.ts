import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerConfigModule } from './swagger-config/swagger-config.module';
import { getCorsOrigins } from './utils/cors-origins.util';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const globalPrefix = 'api';

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: true,
    }),
  });

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3000);
  const env = configService.get<string>('NODE_ENV', 'development');
  const corsOrigins: string[] = getCorsOrigins(configService, env);
  if (env === 'production' && corsOrigins.length === 0) {
    logger.error(
      '❌ Missing required environment variable: CORS_ORIGIN. Please set it, e.g. CORS_ORIGIN=https://myapp.com',
    );
  }

  app.setGlobalPrefix(globalPrefix);

  app.enableCors({ origin: corsOrigins });

  app.useGlobalPipes(
    new ValidationPipe(
      // {
         // whitelist: true,
         // forbidNonWhitelisted: true,
        // transform: true,
     // }
    ),
  );

  SwaggerConfigModule.setup(app);
  app.enableShutdownHooks();

  await app.listen(port);

  logger.log({
    env,
    port,
    globalPrefix,
    corsOrigins,
  });
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start application', error);
  process.exit(1);
});
