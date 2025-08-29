import { applyDecorators, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { AdminOnlyGuard } from '../guards/admin-only.guard';

export function AdminOnly() {
  return applyDecorators(UseGuards(GqlAuthGuard, AdminOnlyGuard));
}
