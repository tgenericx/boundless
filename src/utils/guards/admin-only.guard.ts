import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from 'src/types';
import { Role } from 'generated/graphql';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const user: AuthenticatedUser | undefined = req?.user;

    return user?.roles?.includes(Role.ADMIN) ?? false;
  }
}
