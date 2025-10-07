import { applyDecorators, Injectable, UseGuards, Type } from '@nestjs/common';
import { JwtAuthGuard, AbstractOwnerGuard } from '@/utils/guards';
import { Role } from '@generated/prisma';

import type { IdArgs, OwnershipChain } from '@/types';

/**
 * Local DI-based ownership step config.
 * Used only for configuring the decorator.
 */
interface OwnershipStepConfig {
  resourceName: string;
  serviceToken: string | symbol | Type<any>;
  ownerField: string;
  parentIdField?: string;
}

/**
 * Creates a dynamic owner-or-admin guard chain for nested ownership validation.
 *
 * Each `step` in the chain must include:
 *  - `resourceName`: identifier used for logging and error messages
 *  - `serviceToken`: DI token or class to inject the service
 *  - `ownerField`: field name that holds the owner user ID
 *  - `parentIdField`: (optional) field used to traverse to parent resource
 *
 * Example:
 *  @OwnerOrAdminNested([
 *    { resourceName: 'Comment', serviceToken: CommentService, ownerField: 'userId', parentIdField: 'postId' },
 *    { resourceName: 'Post', serviceToken: PostService, ownerField: 'userId' },
 *  ])
 */
export function OwnerOrAdminNested<
  TResources extends readonly Record<string, any>[],
>(
  steps: OwnershipStepConfig[],
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
    constructor(
      ...injectedServices: {
        findOne: (args: { where: { id: string } }) => Promise<any>;
      }[]
    ) {
      const ownershipSteps = steps.map((step, i) => ({
        resourceName: step.resourceName,
        ownerField: step.ownerField,
        parentIdField: step.parentIdField,
        findResourceById: (id: string) =>
          injectedServices[i]?.findOne({ where: { id } }),
      }));

      super(
        ownershipSteps as OwnershipChain<TResources>,
        bypassRoles,
        forceOwnershipCheck,
      );
    }
  }

  Reflect.defineMetadata(
    'design:paramtypes',
    steps.map((s) => s.serviceToken),
    DynamicOwnerGuard,
  );

  return applyDecorators(UseGuards(JwtAuthGuard, DynamicOwnerGuard));
}
