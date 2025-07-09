import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerConfigModule } from './swagger-config/swagger-config.module';
import {
  ExtendedConsoleLogger,
  GraphqlExceptionFilter,
  HttpExceptionFilter,
} from '@boundless/prisma-service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const globalPrefix = 'api';
  const app = await NestFactory.create(AppModule, {
    logger: new ExtendedConsoleLogger({
      json: true,
      colors: true,
    }),
  });
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3000);
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GraphqlExceptionFilter(), new HttpExceptionFilter());
  SwaggerConfigModule.setup(app);

  await app.listen(port);

  logger.log(
    `✅ Everything okay, 🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  logger.log(`🌱 Environment: ${configService.get('NODE_ENV', 'development')}`);
}
bootstrap().catch((error) => {
  Logger.error('❌ Failed to start application', error);
  process.exit(1);
});
