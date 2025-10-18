import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from '@/types/graphql';

@Injectable()
export class RefreshJwtGuard extends AuthGuard('refresh-jwt') {
  getRequest(context: ExecutionContext) {
    if (context.getType<'graphql'>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext<{ req: { user?: AuthenticatedUser } }>().req;
    }

    return context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
  }
}
