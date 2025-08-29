import { Module } from '@nestjs/common';
import { BoardFollowersService } from './board-followers.service';
import { BoardFollowersResolver } from './board-followers.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [BoardFollowersResolver, BoardFollowersService, PrismaService],
})
export class BoardFollowersModule {}
