import { RpcException } from '@nestjs/microservices';
import { ErrorPayload } from '../interfaces/error-payload.interface';
import { HttpStatus } from '@nestjs/common';

export function extractRpcError(error: unknown): ErrorPayload {
  if (error instanceof RpcException) {
    const payload = error.getError() as ErrorPayload;
    if (payload?.httpCode && payload?.message) return payload;
  }

  return {
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred',
    metadata: { original: error },
  };
}
