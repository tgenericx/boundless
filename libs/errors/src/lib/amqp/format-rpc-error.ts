import { AmqpResponse } from './amqp.types';
import { formatNestJsError } from './errors/nestjs-error';
import { formatPrismaError } from './errors/prisma-error';
import { formatFallbackError } from './errors/fallback-error';

export function formatRpcError<T = unknown>(
  error: unknown,
  data: T,
): AmqpResponse<never> {
  return (
    formatNestJsError(error) ??
    formatPrismaError(error, data) ??
    formatFallbackError(error)
  );
}
