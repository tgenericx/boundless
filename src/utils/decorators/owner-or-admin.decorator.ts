import { applyDecorators, Injectable, UseGuards } from '@nestjs/common';
import { AbstractOwnerGuard } from 'src/utils/guards/abstract-owner.guard';
import { IdArgs, OwnershipChain } from 'src/types';
import { JwtAuthGuard } from 'src/utils/guards';
import { Role } from '@prisma/client';

export function OwnerOrAdminNested<TResources extends Record<string, any>[]>(
  steps: {
    resourceName: string;
    service: { findOne: (params: { where: { id: string } }) => Promise<any> };
    ownerField: string;
  }[],
  bypassRoles: Role[] = [Role.ADMIN],
  forceOwnershipCheck = false,
) {
  @Injectable()
  class DynamicOwnerGuard extends AbstractOwnerGuard<IdArgs, TResources> {
    constructor() {
      const ownershipSteps = steps.map((step) => ({
        resourceName: step.resourceName,
        ownerField: step.ownerField,
        findResourceById: (id: string) =>
          step.service.findOne({ where: { id } }),
      }));

      super(
        ownershipSteps as OwnershipChain<TResources>,
        bypassRoles,
        forceOwnershipCheck,
      );
    }
  }

  return applyDecorators(UseGuards(JwtAuthGuard, DynamicOwnerGuard));
}
