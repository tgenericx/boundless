import { Module } from '@nestjs/common';
import { CampusProfilesService } from './campus-profiles.service';
import { CampusProfilesResolver } from './campus-profiles.resolver';

@Module({
  providers: [CampusProfilesResolver, CampusProfilesService],
})
export class CampusProfilesModule {}
