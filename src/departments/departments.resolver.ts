import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  CreateOneDepartmentArgs,
  Department,
  UpdateOneDepartmentArgs,
} from '@/generated/graphql';
import { DepartmentsService } from './departments.service';
import { AdminOnly } from '@/utils/decorators';
import { Prisma } from '@/generated/prisma';

@Resolver(() => Department)
export class DepartmentsResolver {
  constructor(private readonly departments: DepartmentsService) {}

  @Query(() => [Department])
  async allDepartments(
    @Args('facultyId', { nullable: true }) facultyId?: string,
  ) {
    return this.departments.findAll({
      where: facultyId ? { facultyId } : undefined,
      include: { faculty: true },
    });
  }

  @AdminOnly()
  @Mutation(() => Department)
  async createDepartment(@Args() args: CreateOneDepartmentArgs) {
    return this.departments.create(
      args as unknown as Prisma.DepartmentCreateArgs,
    );
  }

  @AdminOnly()
  @Mutation(() => Department)
  async updateDepartment(@Args() args: UpdateOneDepartmentArgs) {
    return this.departments.update(
      args as unknown as Prisma.DepartmentUpdateArgs,
    );
  }

  @AdminOnly()
  @Mutation(() => Department)
  async deleteDepartment(@Args('id') id: string) {
    return this.departments.remove({ where: { id } });
  }
}
