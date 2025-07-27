import { HttpStatus } from '@nestjs/common';
import { AmqpResponse } from '../amqp.types';

export function formatFallbackError(error: unknown): AmqpResponse<never> {
  return {
    success: false,
    error: {
      message: 'Unknown error',
      originalError: error,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    },
  };
}
