import { HttpException } from '@nestjs/common';

import { HttpStatus } from '@nestjs/common';

export interface RpcExceptionResponse {
  status: 'error';
  message: string;
  code?: string;
  httpCode?: HttpStatus;
  metadata?: Record<string, unknown>;
  originalError?: unknown;
}

export const isRpcExceptionResponse = (
  error: unknown,
): error is RpcExceptionResponse => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  ) {
    const e = error as { status?: unknown; message?: unknown };
    return e.status === 'error' && typeof e.message === 'string';
  }
  return false;
};

export function createRpcExceptionResponse(
  errorObject: RpcExceptionResponse,
): RpcExceptionResponse {
  return {
    status: 'error',
    message: errorObject.message,
    code: errorObject.code,
    httpCode: errorObject.httpCode,
    metadata: errorObject.metadata,
    originalError: errorObject.originalError,
  };
}

export function rpcToHttpException(rpc: RpcExceptionResponse): HttpException {
  return new HttpException(
    {
      status: rpc.status,
      message: rpc.message,
      code: rpc.code,
      metadata: rpc.metadata,
    },
    rpc.httpCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
