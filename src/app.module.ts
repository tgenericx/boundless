import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { TimelineModule } from './timeline/timeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    TimelineModule,
  ],
})
export class AppModule {}
