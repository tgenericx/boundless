import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FacultiesService } from './faculties.service';
import { Faculty } from './entities/faculty.entity';
import { CreateFacultyInput } from './dto/create-faculty.input';
import { UpdateFacultyInput } from './dto/update-faculty.input';

@Resolver(() => Faculty)
export class FacultiesResolver {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Mutation(() => Faculty)
  createFaculty(@Args('createFacultyInput') createFacultyInput: CreateFacultyInput) {
    return this.facultiesService.create(createFacultyInput);
  }

  @Query(() => [Faculty], { name: 'faculties' })
  findAll() {
    return this.facultiesService.findAll();
  }

  @Query(() => Faculty, { name: 'faculty' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.facultiesService.findOne(id);
  }

  @Mutation(() => Faculty)
  updateFaculty(@Args('updateFacultyInput') updateFacultyInput: UpdateFacultyInput) {
    return this.facultiesService.update(updateFacultyInput.id, updateFacultyInput);
  }

  @Mutation(() => Faculty)
  removeFaculty(@Args('id', { type: () => Int }) id: number) {
    return this.facultiesService.remove(id);
  }
}
