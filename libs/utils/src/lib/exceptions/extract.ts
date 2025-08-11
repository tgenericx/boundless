import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';
import { RpcExceptionPayload } from '../../types';

export function extractRpcError(error: unknown): RpcExceptionPayload {
  //  Proper RpcException
  if (error instanceof RpcException) {
    const payload = error.getError() as RpcExceptionPayload;
    if (payload?.httpCode && payload?.message) return payload;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'httpCode' in error &&
    'message' in error
  ) {
    const candidate = error as Partial<RpcExceptionPayload>;
    if (
      typeof candidate.message === 'string' &&
      typeof candidate.httpCode === 'number'
    ) {
      return candidate as RpcExceptionPayload;
    }
  }

  return {
    httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred',
    metadata: { original: error },
  };
}
