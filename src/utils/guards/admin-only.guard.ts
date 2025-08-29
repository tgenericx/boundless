import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from 'src/types/graphql';
import { Role } from 'generated/graphql';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext<{ req: { user?: AuthenticatedUser } }>().req;
    const user = req?.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!user.roles?.includes(Role.ADMIN)) {
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}
