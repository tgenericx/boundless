import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CampusProfilesService } from './campus-profiles.service';
import { CampusProfile } from './entities/campus-profile.entity';
import { CreateCampusProfileInput } from './dto/create-campus-profile.input';
import { UpdateCampusProfileInput } from './dto/update-campus-profile.input';

@Resolver(() => CampusProfile)
export class CampusProfilesResolver {
  constructor(private readonly campusProfilesService: CampusProfilesService) {}

  @Mutation(() => CampusProfile)
  createCampusProfile(@Args('createCampusProfileInput') createCampusProfileInput: CreateCampusProfileInput) {
    return this.campusProfilesService.create(createCampusProfileInput);
  }

  @Query(() => [CampusProfile], { name: 'campusProfiles' })
  findAll() {
    return this.campusProfilesService.findAll();
  }

  @Query(() => CampusProfile, { name: 'campusProfile' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.campusProfilesService.findOne(id);
  }

  @Mutation(() => CampusProfile)
  updateCampusProfile(@Args('updateCampusProfileInput') updateCampusProfileInput: UpdateCampusProfileInput) {
    return this.campusProfilesService.update(updateCampusProfileInput.id, updateCampusProfileInput);
  }

  @Mutation(() => CampusProfile)
  removeCampusProfile(@Args('id', { type: () => Int }) id: number) {
    return this.campusProfilesService.remove(id);
  }
}
