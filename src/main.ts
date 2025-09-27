import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerConfigModule } from './swagger-config/swagger-config.module';

async function bootstrap() {
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
  const corsOrigin =
    env === 'production'
      ? ['http://localhost:3000', configService.get<string>('CORS_ORIGIN', '')]
      : ['http://localhost:3000'];

  app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    origin: corsOrigin,
  });
  app.useGlobalPipes(new ValidationPipe());
  SwaggerConfigModule.setup(app);

  await app.listen(port);

  logger.log(
    `✅ Everything okay, 🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  logger.log(`🌱 Environment: ${env}`);
}

bootstrap().catch((error) => {
  Logger.error('❌ Failed to start application', error);
  process.exit(1);
});
