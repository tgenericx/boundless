import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { extractRpcError } from './extract';
import { httpStatusToCode } from './code.map';

export function rpcToGraphQLError(error: unknown): GraphQLError {
  const payload = extractRpcError(error);

  return new GraphQLError(payload.message, {
    extensions: {
      code: httpStatusToCode(payload.httpCode),
      metadata: payload.metadata,
    },
  });
}

export function formatGraphQLError(error: unknown): GraphQLFormattedError {
  try {
    const payload = extractRpcError(error);

    return {
      message: payload.message,
      extensions: {
        code: httpStatusToCode(payload.httpCode),
        metadata: payload.metadata,
      },
    };
  } catch {
    return {
      message: 'Unexpected server error',
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }
}
