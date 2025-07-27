import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { HttpStatus } from '@nestjs/common';
import { AmqpResponse } from '../amqp.types';

export function formatPrismaError<T = unknown>(
  error: unknown,
  data: T,
): AmqpResponse<never> | undefined {
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

      const message =
        violations.length === 1
          ? `The ${violations[0].field} '${violations[0].value}' is already in use.`
          : `The following are already in use: ${violations.map((v) => `${v.field} '${v.value}'`).join(' and ')}`;

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
}
