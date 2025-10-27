import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { Faculty, UpdateOneFacultyArgs } from '@/generated/graphql';
import { AdminOnly } from '@/utils/decorators';
import { FacultiesService } from './faculties.service';
import { Prisma } from '@/generated/prisma';

@Resolver(() => Faculty)
export class FacultiesResolver {
  constructor(private readonly faculty: FacultiesService) {}

  @Query(() => [Faculty])
  async faculties() {
    return await this.faculty.findAll({
      include: { departments: true },
    });
  }

  @Query(() => Faculty, { nullable: true })
  async oneFaculty(@Args('id') id: string) {
    return await this.faculty.findOne({
      where: { id },
      include: { departments: true },
    });
  }

  @AdminOnly()
  @Mutation(() => Faculty)
  async createFaculty(
    @Args('name') name: string,
    @Args('code', { nullable: true }) code?: string,
  ) {
    return this.faculty.create({ data: { name, code } });
  }

  @AdminOnly()
  @Mutation(() => Faculty)
  async updateFaculty(@Args() args: UpdateOneFacultyArgs) {
    return this.faculty.update(args as unknown as Prisma.FacultyUpdateArgs);
  }

  @AdminOnly()
  @Mutation(() => Faculty)
  async deleteFaculty(@Args('id') id: string) {
    return this.faculty.remove({ where: { id } });
  }
}
