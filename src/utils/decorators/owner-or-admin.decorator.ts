import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { OwnerOrAdminGuard } from '../guards/owner-or-admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export const OWNER_ADMIN_META = 'ownerOrAdminMeta';

export interface OwnerOrAdminMeta {
  resource: string;
  wherePath: string;
  ownerField: string;
}

export function OwnerOrAdmin(meta: OwnerOrAdminMeta) {
  if (!meta.ownerField) {
    throw new Error(
      `@OwnerOrAdmin() requires an explicit 'ownerField' (e.g., 'userId' or 'createdById')`,
    );
  }

  return applyDecorators(
    SetMetadata(OWNER_ADMIN_META, meta),
    UseGuards(JwtAuthGuard, OwnerOrAdminGuard),
  );
}
