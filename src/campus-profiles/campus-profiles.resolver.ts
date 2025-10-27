import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  CampusProfile,
  CreateOneCampusProfileArgs,
  UpdateOneCampusProfileArgs,
} from '@/generated/graphql';
import { CampusProfilesService } from './campus-profiles.service';
import { CurrentUser, AdminOnly } from '@/utils/decorators';
import { type AuthenticatedUser } from '@/types';
import { Prisma } from '@/generated/prisma';

@Resolver(() => CampusProfile)
export class CampusProfilesResolver {
  constructor(private readonly campusProfile: CampusProfilesService) {}

  @Query(() => [CampusProfile])
  async allCampusProfiles() {
    return this.campusProfile.findAll({
      include: {
        faculty: true,
        department: true,
        user: true,
      },
    });
  }

  @Query(() => CampusProfile, { nullable: true })
  async oneCampusProfile(@Args('id') id: string) {
    return this.campusProfile.findOne({
      where: { id },
      include: {
        faculty: true,
        department: true,
        user: true,
      },
    });
  }

  @Query(() => CampusProfile, { nullable: true })
  async myCampusProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.campusProfile.findByUser(user.userId);
  }

  @Mutation(() => CampusProfile)
  async createCampusProfile(
    @Args() args: CreateOneCampusProfileArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.campusProfile.create({
      data: {
        ...args.data,
        user: { connect: { id: user.userId } },
      },
      include: {
        faculty: true,
        department: true,
      },
    } as unknown as Prisma.CampusProfileCreateArgs);
  }

  @Mutation(() => CampusProfile)
  async updateCampusProfile(
    @Args() args: UpdateOneCampusProfileArgs,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.campusProfile.findByUser(user.userId);
    if (!existing) throw new Error('Profile not found');

    return this.campusProfile.update({
      where: { id: existing.id },
      data: args.data,
      include: { faculty: true, department: true },
    } as unknown as Prisma.CampusProfileUpdateArgs);
  }

  @AdminOnly()
  @Mutation(() => CampusProfile)
  async deleteCampusProfile(@Args('id') id: string) {
    return this.campusProfile.remove({ where: { id } });
  }
}
