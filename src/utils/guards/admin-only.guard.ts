import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { AuthenticatedUser } from 'src/types/graphql';
import { Role } from '@/generated/prisma';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    let req: Request & { user?: AuthenticatedUser };

    if (context.getType<'graphql'>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      req = ctx.getContext<{ req: Request & { user?: AuthenticatedUser } }>()
        .req;
    } else {
      req = context
        .switchToHttp()
        .getRequest<Request & { user?: AuthenticatedUser }>();
    }

    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!Array.isArray(user?.roles) || !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}
