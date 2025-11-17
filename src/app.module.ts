import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
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
import { CacheConfigModule } from './cache/cache.module';
import { FeedModule } from './feed/feed.module';
import { RedisModule } from './redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FacultiesModule } from './faculties/faculties.module';
import { DepartmentsModule } from './departments/departments.module';
import { CampusProfilesModule } from './campus-profiles/campus-profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const username = config.get<string>('REDIS_USERNAME', '');
        const password = config.get<string>('REDIS_PASSWORD', '');
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = config.get<number>('REDIS_PORT', 6379);
        const env = config.get<string>('NODE_ENV', 'development').toLowerCase();

        const redisUrl =
          env === 'development'
            ? `redis://${host}:${port}`
            : `redis://${username}:${password}@${host}:${port}`;

        return {
          throttlers: [
            { name: 'main', ttl: seconds(60), limit: 10 },
            { name: 'short', ttl: seconds(10), limit: 3 },
            { name: 'medium', ttl: seconds(30), limit: 10 },
            { name: 'long', ttl: seconds(120), limit: 100 },
          ],
          storage: new ThrottlerStorageRedisService(redisUrl),
        };
      },
    }),
    CacheConfigModule,
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
    FeedModule,
    RedisModule,
    ScheduleModule.forRoot(),
    FacultiesModule,
    DepartmentsModule,
    CampusProfilesModule,
  ],
})
export class AppModule {}
