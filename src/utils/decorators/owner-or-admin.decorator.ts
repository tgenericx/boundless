import { applyDecorators, Injectable, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, AbstractOwnerGuard } from 'src/utils/guards';
import { Role } from '@prisma/client';

import type { IdArgs, OwnershipChain } from 'src/types';

/**
 * Creates a dynamic owner-or-admin guard chain for nested ownership validation.
 *
 * Each `step` in the chain must include:
 *  - `resourceName`: identifier used for logging and error messages
 *  - `service.findOne`: method that fetches the resource by ID
 *  - `ownerField`: field name that holds the owner user ID
 *  - `parentIdField`: (optional) field used to traverse to parent resource
 *
 * Example:
 *  @OwnerOrAdminNested([
 *    { resourceName: 'Comment', service: commentService, ownerField: 'userId', parentIdField: 'postId' },
 *    { resourceName: 'Post', service: postService, ownerField: 'userId' },
 *  ])
 */
export function OwnerOrAdminNested<
  TResources extends readonly Record<string, any>[],
>(
  steps: {
    resourceName: string;
    service: { findOne: (params: { where: { id: string } }) => Promise<any> };
    ownerField: string;
    parentIdField?: string;
  }[],
  bypassRoles: Role[] = [Role.ADMIN],
  forceOwnershipCheck = false,
) {
  if (!steps?.length) {
    throw new Error(
      '⚠️  OwnerOrAdminNested requires at least one step in the ownership chain.',
    );
  }

  @Injectable()
  class DynamicOwnerGuard extends AbstractOwnerGuard<IdArgs, TResources> {
    constructor() {
      const ownershipSteps = steps.map((step) => ({
        resourceName: step.resourceName,
        ownerField: step.ownerField,
        parentIdField: step.parentIdField,
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
