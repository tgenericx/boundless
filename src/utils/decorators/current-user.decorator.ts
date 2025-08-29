import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { AuthenticatedUser } from 'src/types';

export const CurrentUser = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): AuthenticatedUser | undefined => {
    if (context.getType<'graphql'>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext<{ req: { user?: AuthenticatedUser } }>().req.user;
    }

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    return req.user;
  },
);
