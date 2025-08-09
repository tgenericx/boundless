import { HttpStatus } from '@nestjs/common';

// MARK: - Transport Core Types
export interface TransportResponse<T> {
  success: boolean;
  data?: T;
  error?: TransportError;
}

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

// Utility functions with deprecation notices
export function isTransportSuccess<T>(
  response: TransportResponse<T>,
): response is { success: true; data: T } {
  return response.success === true;
}

/** @deprecated Use isTransportSuccess */
export const isAmqpSuccess = isTransportSuccess;
