import { GraphQLError } from 'graphql';
import { extractRpcError } from './extract';
import { httpStatusToCode } from './code.map';
import { Logger } from '@nestjs/common';
import { ErrorPayload } from '../interfaces/error-payload.interface';

export function rpcToGraphQLError(error: unknown): GraphQLError {
  const payload = extractRpcError(error);

  return new GraphQLError(payload.message, {
    extensions: {
      code: httpStatusToCode(payload.httpCode),
      metadata: payload.metadata,
    },
  });
}

export const isRpcExceptionResponse = (
  error: unknown,
): error is ErrorPayload => {
  if (typeof error === 'object' && error !== null) {
    const e = error as ErrorPayload;
    return typeof e.message === 'string';
  }
  return false;
};

export function GraphQLErrorHelper(err: unknown): never {
  const logger = new Logger('GraphQLErrorHelper');
  logger.error(err);
  if (isRpcExceptionResponse(err)) {
    throw rpcToGraphQLError(err);
  }
  throw err;
}
