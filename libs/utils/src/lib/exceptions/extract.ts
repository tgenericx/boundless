import { RpcException } from '@nestjs/microservices';
import { ErrorPayload } from '../interfaces/error-payload.interface';
import { HttpStatus } from '@nestjs/common';

export function extractRpcError(error: unknown): ErrorPayload {
  //  Proper RpcException
  if (error instanceof RpcException) {
    const payload = error.getError() as ErrorPayload;
    if (payload?.httpCode && payload?.message) return payload;
  }

  //  Raw object passed over wire
  if (
    typeof error === 'object' &&
    error !== null &&
    'httpCode' in error &&
    'message' in error
  ) {
    return error as ErrorPayload;
  }

  return {
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred',
    metadata: { original: error },
  };
}
