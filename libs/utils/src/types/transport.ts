import { HttpStatus } from '@nestjs/common';

interface BaseTransportError {
  message: string;
  meta?: Record<string, unknown>;
}

interface HttpExceptionTransportError extends BaseTransportError {
  type: 'HttpException';
  code: string;
  httpStatus: HttpStatus;
}

interface PrismaErrorTransportError extends BaseTransportError {
  type: 'PrismaClientKnownRequestError';
  code: string;
  httpStatus: HttpStatus;
}

interface BaseTransportError {
  message: string;
  meta?: Record<string, unknown>;
  target?: string[];
  originalError?: unknown;
}

interface UnknownErrorTransportError extends BaseTransportError {
  type: 'UnknownError';
  httpStatus: HttpStatus;
}

export type TransportError =
  | HttpExceptionTransportError
  | PrismaErrorTransportError
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
