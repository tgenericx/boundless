import { Injectable } from '@nestjs/common';
import { CreateCampusProfileInput } from './dto/create-campus-profile.input';
import { UpdateCampusProfileInput } from './dto/update-campus-profile.input';

@Injectable()
export class CampusProfilesService {
  create(createCampusProfileInput: CreateCampusProfileInput) {
    return 'This action adds a new campusProfile';
  }

  findAll() {
    return `This action returns all campusProfiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} campusProfile`;
  }

  update(id: number, updateCampusProfileInput: UpdateCampusProfileInput) {
    return `This action updates a #${id} campusProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} campusProfile`;
  }
}
