import { Module } from '@nestjs/common';
import { BoardFollowersService } from './board-followers.service';
import { BoardFollowersResolver } from './board-followers.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BoardFollowersResolver, BoardFollowersService],
})
export class BoardFollowersModule {}
