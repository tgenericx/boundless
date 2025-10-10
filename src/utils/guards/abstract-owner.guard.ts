import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@/generated/prisma';

import type { AuthenticatedUser, IdArgs, OwnershipChain } from '@/types';

@Injectable()
export abstract class AbstractOwnerGuard<
  TArgs extends IdArgs = IdArgs,
  TResources extends readonly Record<string, any>[] = [Record<string, any>],
> implements CanActivate
{
  protected readonly logger = new Logger(AbstractOwnerGuard.name);

  constructor(
    private readonly steps: OwnershipChain<TResources>,
    private readonly bypassRoles: Role[] = [Role.ADMIN],
    private readonly forceOwnershipCheck = false,
  ) {
    if (!steps?.length) {
      throw new Error(
        `${AbstractOwnerGuard.name}: Ownership chain cannot be empty. Provide at least one resource step.`,
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlCtx = GqlExecutionContext.create(context);

    const ctx = gqlCtx.getContext<{ req?: { user?: AuthenticatedUser } }>();
    const user = ctx?.req?.user;
    const args = gqlCtx.getArgs<TArgs>();

    if (!user)
      throw new UnauthorizedException(
        'Unauthorized: no user in request context',
      );

    if (!this.forceOwnershipCheck) {
      if (
        Array.isArray(user.roles) &&
        this.bypassRoles.some((r) => user.roles.includes(r))
      ) {
        this.logger.debug(
          `✅ User ${user.userId} bypassed ownership check (roles: ${user.roles.join(', ')})`,
        );
        return true;
      }
    }

    const id: string | undefined = args?.where?.id ?? args?.id;
    if (!id)
      throw new ForbiddenException('Missing resource ID for ownership check');

    let currentId = id;

    for (const [index, step] of this.steps.entries()) {
      const resource = await step.findResourceById(currentId);
      if (!resource) {
        throw new ForbiddenException(
          `Resource not found (${step.resourceName}, id: ${currentId})`,
        );
      }

      if (!(step.ownerField in resource)) {
        throw new ForbiddenException(
          `Invalid ownership config: field "${String(step.ownerField)}" does not exist on ${step.resourceName}`,
        );
      }

      const ownerId = resource[step.ownerField] as unknown as
        | string
        | null
        | undefined;
      if (!ownerId) {
        this.logger.warn(
          `${step.resourceName} (${currentId}) has no owner (${String(step.ownerField)} is ${ownerId}). Denying access.`,
        );
        throw new ForbiddenException(
          `Cannot verify ownership: ${step.resourceName} has no assigned owner.`,
        );
      }

      const isLastStep = index === this.steps.length - 1;

      if (isLastStep) {
        if (ownerId !== user.userId) {
          throw new ForbiddenException(
            `Not authorized to access ${step.resourceName} (expected owner ${ownerId}, got ${user.userId})`,
          );
        }
        this.logger.debug(
          `✅ Ownership verified for ${user.userId} on ${step.resourceName}`,
        );
      } else {
        // traverse to parent id
        const parentIdField = step.parentIdField;
        if (!parentIdField) {
          throw new ForbiddenException(
            `Invalid ownership config: missing parentIdField on ${step.resourceName}`,
          );
        }

        if (!(parentIdField in resource)) {
          throw new ForbiddenException(
            `Invalid ownership config: missing parentIdField "${String(parentIdField)}" on ${step.resourceName}`,
          );
        }

        const nextId = resource[parentIdField] as string | null | undefined;
        if (!nextId) {
          throw new ForbiddenException(
            `Missing parent reference (${step.resourceName}.${String(parentIdField)})`,
          );
        }

        currentId = nextId;
      }
    }

    return true;
  }
}
