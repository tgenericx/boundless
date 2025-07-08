import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GraphQLErrorCode, HttpToGraphQLErrorMap } from './error-code.map';
import { GraphQLError } from 'graphql';

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
  const logger = new Logger('rpcToHttpException');
  logger.error(rpc);
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

export function rpcToGraphQLError(rpc: RpcExceptionResponse): GraphQLError {
  const httpCode = rpc.httpCode ?? 500;
  const graphqlCode =
    HttpToGraphQLErrorMap[httpCode] ?? GraphQLErrorCode.InternalServerError;

  return new GraphQLError(rpc.message, {
    extensions: {
      code: graphqlCode,
      status: rpc.status,
      httpCode,
      errorCode: rpc.code,
      metadata: rpc.metadata,
    },
  });
}
