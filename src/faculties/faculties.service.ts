import { Injectable } from '@nestjs/common';
import { CreateFacultyInput } from './dto/create-faculty.input';
import { UpdateFacultyInput } from './dto/update-faculty.input';

@Injectable()
export class FacultiesService {
  create(createFacultyInput: CreateFacultyInput) {
    return 'This action adds a new faculty';
  }

  findAll() {
    return `This action returns all faculties`;
  }

  findOne(id: number) {
    return `This action returns a #${id} faculty`;
  }

  update(id: number, updateFacultyInput: UpdateFacultyInput) {
    return `This action updates a #${id} faculty`;
  }

  remove(id: number) {
    return `This action removes a #${id} faculty`;
  }
}
