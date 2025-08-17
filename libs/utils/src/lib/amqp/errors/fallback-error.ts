import { HttpStatus } from '@nestjs/common';
import { TransportResponse } from '../../../types';

export function formatFallbackError(error: unknown): TransportResponse<never> {
  return {
    success: false,
    error: {
      type: 'UnknownError',
      message:
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      meta:
        error instanceof Error
          ? { stack: error.stack }
          : { original: safeStringify(error) },
    },
  };
}

function safeStringify(input: unknown): string {
  try {
    return JSON.stringify(input, null, 2);
  } catch {
    return String(input);
  }
}
