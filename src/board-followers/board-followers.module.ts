import { Module } from '@nestjs/common';
import { BoardFollowersService } from './board-followers.service';
import { BoardFollowersResolver } from './board-followers.resolver';

@Module({
  providers: [BoardFollowersResolver, BoardFollowersService],
})
export class BoardFollowersModule {}
