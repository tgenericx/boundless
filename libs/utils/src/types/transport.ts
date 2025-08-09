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

// MARK: - Compatibility Layer
/**
 * @deprecated Use TransportResponse instead
 */
export type AmqpResponse<T> = TransportResponse<T>;

/**
 * @deprecated Use TransportError instead
 */
export type AmqpError = TransportError;

export function isTransportSuccess<T>(
  response: TransportResponse<T>,
): response is { success: true; data: T } {
  return response.success === true;
}

/** @deprecated Use isTransportSuccess */
export const isAmqpSuccess = isTransportSuccess;

export function isTransportError<T>(
  response: TransportResponse<T>,
): response is { success: false; error: TransportError } {
  return response.success === false;
}

/** @deprecated Use isTransportError */
export const isAmqpError = isTransportError;
