import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminOnlyGuard } from '../guards/admin-only.guard';

export function AdminOnly() {
  return applyDecorators(UseGuards(JwtAuthGuard, AdminOnlyGuard));
}
