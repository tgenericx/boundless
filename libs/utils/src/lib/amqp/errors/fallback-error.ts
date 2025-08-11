import { HttpStatus } from '@nestjs/common';
import { TransportResponse } from '../../../types';

export function formatFallbackError(error: unknown): TransportResponse<never> {
  return {
    success: false,
    error: {
      message: 'Unknown error',
      originalError: error,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    },
  };
}
