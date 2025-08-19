import { HttpStatus } from '@nestjs/common';

interface BaseTransportError {
  message: string;
  code?: string;
  httpStatus: HttpStatus;
  meta?: Record<string, unknown>;
  originalError?: unknown;
}

interface HttpExceptionTransportError extends BaseTransportError {
  type: 'HttpException';
}

interface PrismaKnownRequestErrorTransportError extends BaseTransportError {
  type: 'PrismaClientKnownRequestError';
}

interface UniqueConstraintViolationError extends BaseTransportError {
  type: 'UniqueConstraintViolation';
  meta: {
    target?: string[];
    conflictingValues: Record<string, unknown>;
  };
}

interface PrismaUnknownRequestErrorTransportError extends BaseTransportError {
  type: 'PrismaClientUnknownRequestError';
}

interface PrismaInitializationErrorTransportError extends BaseTransportError {
  type: 'PrismaClientInitializationError';
}

interface PrismaRustPanicErrorTransportError extends BaseTransportError {
  type: 'PrismaClientRustPanicError';
}

interface PrismaValidationErrorTransportError extends BaseTransportError {
  type: 'PrismaClientValidationError';
}

interface UnknownErrorTransportError extends BaseTransportError {
  type: 'UnknownError';
}

export type TransportError =
  | HttpExceptionTransportError
  | PrismaKnownRequestErrorTransportError
  | UniqueConstraintViolationError
  | PrismaUnknownRequestErrorTransportError
  | PrismaInitializationErrorTransportError
  | PrismaRustPanicErrorTransportError
  | PrismaValidationErrorTransportError
  | UnknownErrorTransportError;

export type TransportResponse<T> =
  | { success: true; data: T }
  | { success: false; error: TransportError };

export function isTransportSuccess<T>(
  response: TransportResponse<T>,
): response is { success: true; data: T } {
  return response.success === true;
}

export function isTransportError<T>(
  response: TransportResponse<T>,
): response is { success: false; error: TransportError } {
  return response.success === false;
}
