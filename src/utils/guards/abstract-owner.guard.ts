import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { AuthenticatedUser, IdArgs, type OwnershipChain } from 'src/types';

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
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext<{ req?: { user?: AuthenticatedUser } }>();
    const args = gqlCtx.getArgs<TArgs>();
    const user = ctx.req?.user;

    if (!user) throw new UnauthorizedException();

    // ✅ Admin or privileged role bypass
    if (!this.forceOwnershipCheck) {
      if (
        Array.isArray(user.roles) &&
        this.bypassRoles.some((role) => user.roles.includes(role))
      ) {
        this.logger.debug(
          `✅ User ${user.userId} bypassed ownership check (roles: ${user.roles.join(', ')})`,
        );
        return true;
      }
    }

    let id: string | undefined = args.where?.id ?? args.id;
    if (!id) throw new ForbiddenException('Missing resource ID');

    for (const [index, step] of this.steps.entries()) {
      const resource = await step.findResourceById(id);
      if (!resource)
        throw new ForbiddenException(
          `Resource not found (${step.resourceName}, id: ${id})`,
        );

      const ownerId = resource[step.ownerField] as unknown as string;
      if (typeof ownerId !== 'string')
        throw new ForbiddenException(
          `Resource missing owner field (${step.resourceName})`,
        );

      const isLastStep = index === this.steps.length - 1;

      if (isLastStep) {
        if (ownerId !== user.userId)
          throw new ForbiddenException(
            `Not authorized to access ${step.resourceName} (owner: ${ownerId})`,
          );

        this.logger.debug(
          `✅ Ownership verified for ${user.userId} on ${step.resourceName}`,
        );
      } else {
        const nextId = resource[step.parentIdField as string] as string;
        if (!nextId)
          throw new ForbiddenException(
            `Missing parent reference (${step.resourceName}.${String(
              step.parentIdField,
            )})`,
          );
        id = nextId;
      }
    }

    return true;
  }
}
