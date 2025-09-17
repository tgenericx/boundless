import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GqlModule } from './gql/gql.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { SchedulesModule } from './schedules/schedules.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { BoardsModule } from './boards/boards.module';
import { PostsModule } from './posts/posts.module';
import { BoardFollowersModule } from './board-followers/board-followers.module';
import { UserFollowsModule } from './user-follows/user-follows.module';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfigService } from './mailer.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GqlModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    SchedulesModule,
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
  ],
})
export class AppModule {}
