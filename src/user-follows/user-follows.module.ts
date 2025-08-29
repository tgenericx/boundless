import { Module } from '@nestjs/common';
import { UserFollowsService } from './user-follows.service';
import { UserFollowsResolver } from './user-follows.resolver';

@Module({
  providers: [UserFollowsResolver, UserFollowsService],
})
export class UserFollowsModule {}
