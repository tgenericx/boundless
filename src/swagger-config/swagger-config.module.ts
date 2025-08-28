import { Module } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

@Module({})
export class SwaggerConfigModule {
  static setup(app: INestApplication): void {
    const env = process.env.NODE_ENV?.toLowerCase();
    if (env !== 'development' && env !== 'test') return;

    const config = new DocumentBuilder()
      .setTitle('QuickPost API')
      .setDescription('The QuickPost REST API docs')
      .setVersion('1.0')
      .addTag('posts')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, { useGlobalPrefix: true });
    SwaggerModule.setup('api/docs', app, document);
  }
}
