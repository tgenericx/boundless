import { HttpStatus } from '@nestjs/common';

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
