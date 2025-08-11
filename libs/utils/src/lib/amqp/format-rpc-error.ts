import { TransportResponse } from '../../types';
import { formatNestJsError } from './errors/nestjs-error';
import { formatPrismaError } from './errors/prisma-error';
import { formatFallbackError } from './errors/fallback-error';

export function formatRpcError<T = unknown>(
  error: unknown,
  data: T,
): TransportResponse<never> {
  return (
    formatNestJsError(error) ??
    formatPrismaError(error, data) ??
    formatFallbackError(error)
  );
}
