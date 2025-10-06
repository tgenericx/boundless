import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import {
  OWNER_ADMIN_META,
  OwnerOrAdminMeta,
} from '../decorators/owner-or-admin.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from 'src/types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  private readonly logger = new Logger(OwnerOrAdminGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlCtx = GqlExecutionContext.create(context);
    const meta = this.reflector.get<OwnerOrAdminMeta>(
      OWNER_ADMIN_META,
      context.getHandler(),
    );

    const ownershipDebug =
      this.config.get<boolean>('OWNERSHIP_DEBUG') === true ||
      this.config.get<string>('OWNERSHIP_DEBUG') === 'true';

    const debugFromMeta =
      typeof meta === 'object' &&
      meta !== null &&
      (meta as unknown as Record<string, unknown>)['debug'] === true;

    const DEBUG_MODE = ownershipDebug || debugFromMeta;

    const log = (...parts: unknown[]): void => {
      if (!DEBUG_MODE) return;

      const message = parts
        .map((p) => {
          if (typeof p === 'object' && p !== null) {
            try {
              return JSON.stringify(p);
            } catch {
              return '[Unserializable Object]';
            }
          }
          return String(p);
        })
        .join(' ');

      this.logger.debug(message);
    };

    if (!meta) {
      log('❌ Missing ownership metadata on resolver');
      throw new ForbiddenException('Missing ownership metadata on resolver');
    }

    const { resource, wherePath, ownerField } = meta;

    const ctx = gqlCtx.getContext<{
      req?: { user?: AuthenticatedUser; app?: any };
    }>();

    const req = ctx?.req;
    const user = req?.user;

    if (!user) {
      log('❌ No authenticated user found in context');
      throw new ForbiddenException('Not authenticated');
    }

    log(
      `👤 Authenticated User: ${user.userId}`,
      'Roles:',
      JSON.stringify(user.roles),
    );

    if (Array.isArray(user.roles) && user.roles.includes(Role.ADMIN)) {
      log('✅ Admin detected — ownership check skipped');
      return true;
    }

    const args = gqlCtx.getArgs<Record<string, unknown>>();
    const id = wherePath.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, args);

    log(`🔍 Extracted ID via path "${wherePath}" →`, id);

    if (typeof id !== 'string') {
      log('❌ Missing or invalid resource ID');
      throw new ForbiddenException('Missing or invalid resource ID');
    }

    const serviceName = `${resource}sService`;
    const maybeApp = req?.app as
      | { get?: (name: string) => unknown }
      | undefined;

    const resourceService: unknown =
      typeof maybeApp?.get === 'function'
        ? maybeApp.get(serviceName)
        : (ctx as Record<string, unknown>)[serviceName];

    if (
      !resourceService ||
      typeof resourceService !== 'object' ||
      typeof (resourceService as Record<string, unknown>).findOne !== 'function'
    ) {
      log(`❌ Invalid resource service: ${serviceName}`);
      throw new ForbiddenException(`Invalid service for resource: ${resource}`);
    }

    log(`🧩 Located service: ${serviceName}`);

    const found = await (
      resourceService as {
        findOne: (params: {
          where: { id: string };
        }) => Promise<Record<string, unknown> | null>;
      }
    ).findOne({ where: { id } });

    if (!found) {
      log(`❌ Resource not found (id: ${id})`);
      throw new ForbiddenException('Resource not found');
    }

    const ownerId = found[ownerField];
    log(`🔗 Owner field "${ownerField}" =`, ownerId);

    if (typeof ownerId !== 'string') {
      log(`❌ Resource missing ownership field: ${ownerField}`);
      throw new ForbiddenException(
        `Resource missing ownership field: ${ownerField}`,
      );
    }

    if (ownerId !== user.userId) {
      log(`❌ Unauthorized — User ${user.userId} ≠ Owner ${ownerId}`);
      throw new ForbiddenException('Not authorized to modify this resource');
    }

    log('✅ Ownership verified successfully');
    return true;
  }
}
