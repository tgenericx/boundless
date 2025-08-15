import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '@boundless/types/interfaces';
import { UserRole } from '@boundless/types/prisma';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user: AuthenticatedUser = ctx.getContext().req.user;

    if (!user?.roles || user.roles.length === 0) {
      return false;
    }

    return requiredRoles.some((requiredRole) =>
      user.roles.includes(requiredRole),
    );
  }
}
