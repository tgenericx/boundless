export type AmqpError = {
  type?: string;
  message: string;
  code?: string;
  meta?: Record<string, unknown>;
  target?: string[];
  originalError?: unknown;
};

export type AmqpResponse<T> =
  | { success: true; data: T }
  | { success: false; error: AmqpError };

export function isAmqpSuccess<T>(
  response: AmqpResponse<T>,
): response is { success: true; data: T } {
  return response.success === true;
}

export function isAmqpError<T>(
  response: AmqpResponse<T>,
): response is { success: false; error: AmqpError } {
  return response.success === false;
}

export function formatRpcError<T = unknown>(
  error: unknown,
  data: T,
): AmqpResponse<never> {
  // Handle Prisma known errors
  if (error instanceof PrismaClientKnownRequestError) {
    const meta = (error.meta as { target?: string[] }) || {};

    // Special handling for unique constraint violation
    if (error.code === 'P2002') {
      const targetFields = meta.target || ['field'];

      // Extract all violating values from user input
      const violations = targetFields
        .map((field) => {
          const value =
            typeof data === 'object' && data !== null
              ? (data as Record<string, unknown>)[field]
              : undefined;
          return { field, value };
        })
        .filter((v) => v.value !== undefined);

      // Format receiver message
      let message: string;

      if (violations.length === 1) {
        message = `The ${violations[0].field} '${violations[0].value}' is already in use.`;
      } else {
        const fieldsList = violations
          .map((v) => `${v.field} '${v.value}'`)
          .join(' and ');
        message = `The following are already in use: ${fieldsList}.`;
      }

      return {
        success: false,
        error: {
          type: 'UniqueConstraintViolation',
          message: message,
          code: error.code,
          meta: {
            ...error.meta,
            conflictingValues: violations.reduce(
              (acc, { field, value }) => {
                acc[field] = value;
                return acc;
              },
              {} as Record<string, unknown>,
            ),
          },
          target: targetFields,
        },
      };
    }

    // General Prisma known error
    return {
      success: false,
      error: {
        type: 'PrismaClientKnownRequestError',
        message: error.message,
        code: error.code,
        meta: error.meta,
      },
    };
  }

  if (error instanceof PrismaClientUnknownRequestError) {
    return {
      success: false,
      error: {
        type: 'PrismaClientUnknownRequestError',
        message: error.message,
      },
    };
  }

  if (error instanceof PrismaClientInitializationError) {
    return {
      success: false,
      error: {
        type: 'PrismaClientInitializationError',
        message: error.message,
        code: error.errorCode,
      },
    };
  }

  if (error instanceof PrismaClientRustPanicError) {
    return {
      success: false,
      error: {
        type: 'PrismaClientRustPanicError',
        message: error.message,
      },
    };
  }

  if (error instanceof PrismaClientValidationError) {
    return {
      success: false,
      error: {
        type: 'PrismaClientValidationError',
        message: error.message,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        type: error.name,
        message: error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      message: 'Unknown error',
      originalError: error,
    },
  };
}

import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
