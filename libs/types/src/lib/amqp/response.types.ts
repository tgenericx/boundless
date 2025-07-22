export type AmqpError = {
  type?: string;
  message: string;
  code?: string;
  httpStatus?: HttpStatus;
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

    if (error.code === 'P2002') {
      const targetFields = meta.target || ['field'];
      const violations = targetFields
        .map((field) => {
          const value =
            typeof data === 'object' && data !== null
              ? (data as Record<string, unknown>)[field]
              : undefined;
          return { field, value };
        })
        .filter((v) => v.value !== undefined);

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
          message,
          code: error.code,
          httpStatus: HttpStatus.CONFLICT,
          meta: {
            ...error.meta,
            conflictingValues: Object.fromEntries(
              violations.map((v) => [v.field, v.value]),
            ),
          },
          target: targetFields,
        },
      };
    }

    // General Prisma known error (default to 400 Bad Request)
    return {
      success: false,
      error: {
        type: 'PrismaClientKnownRequestError',
        message: error.message,
        code: error.code,
        httpStatus: HttpStatus.BAD_REQUEST,
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
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
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
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
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
        httpStatus: HttpStatus.BAD_REQUEST,
      },
    };
  }

  return {
    success: false,
    error: {
      message: 'Unknown error',
      originalError: error,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
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
import { HttpStatus } from '@nestjs/common';
