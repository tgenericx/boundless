import { Module } from '@nestjs/common';
import { UserFollowsService } from './user-follows.service';
import { UserFollowsResolver } from './user-follows.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [UserFollowsResolver, UserFollowsService, PrismaService],
})
export class UserFollowsModule {}
