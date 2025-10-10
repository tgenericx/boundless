import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { GqlModule } from './gql/gql.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { EventsModule } from './events/events.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { BoardsModule } from './boards/boards.module';
import { PostsModule } from './posts/posts.module';
import { BoardFollowersModule } from './board-followers/board-followers.module';
import { UserFollowsModule } from './user-follows/user-follows.module';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfigService } from './mailer.config';
import { BusinessesModule } from './businesses/businesses.module';
import { InventoriesModule } from './inventories/inventories.module';
import { ListingsModule } from './listings/listings.module';
import { MediaRelationsModule } from './media-relations/media-relations.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'main',
            ttl: 60,
            limit: 10,
          },
          {
            name: 'short',
            ttl: 1000,
            limit: 3,
          },
          {
            name: 'medium',
            ttl: 10000,
            limit: 20,
          },
          {
            name: 'long',
            ttl: 60000,
            limit: 100,
          },
        ],
        storage: new ThrottlerStorageRedisService(
          `redis://${configService.get('REDIS_HOST') || '127.0.0.1'}:${configService.get('REDIS_PORT') || 6379}`,
        ),
      }),
    }),
    GqlModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    EventsModule,
    PubSubModule,
    BoardsModule,
    PostsModule,
    BoardFollowersModule,
    UserFollowsModule,
    PrismaModule,
    CloudinaryModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MailerConfigService,
    }),
    BusinessesModule,
    InventoriesModule,
    ListingsModule,
    MediaRelationsModule,
    CacheModule,
  ],
})
export class AppModule {}
