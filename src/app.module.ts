import { HttpStatus, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GqlModule } from './gql/gql.module';
import { PostsModule } from './posts/posts.module';
import {
  PrismaModule,
  providePrismaClientExceptionFilter,
} from 'nestjs-prisma';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SwaggerConfigModule } from './swagger-config/swagger-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        return {
          prismaOptions: {
            log: ['info', 'query', 'warn', 'error'],
            datasources: {
              db: {
                url: await configService.get('DATABASE_URL'),
              },
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    GqlModule,
    PostsModule,
    PubSubModule,
    CloudinaryModule,
    SwaggerConfigModule,
  ],
  providers: [
    providePrismaClientExceptionFilter({
      P2000: HttpStatus.BAD_REQUEST,
      P2002: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
    }),
  ],
})
export class AppModule {}
