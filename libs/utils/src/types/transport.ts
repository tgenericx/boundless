import { HttpStatus } from '@nestjs/common';

export type TransportResponse<T> =
  | { success: true; data: T }
  | { success: false; error: TransportError };

export interface TransportError {
  type?: string;
  message: string;
  code?: string;
  httpStatus?: HttpStatus;
  meta?: Record<string, unknown>;
  target?: string[];
  originalError?: unknown;
}

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
