import { HttpException, Logger } from '@nestjs/common';
import { extractRpcError } from './extract';
import { httpStatusToCode } from './code.map';
import { ErrorPayload } from '../interfaces/error-payload.interface';
import { isRpcExceptionResponse } from './gql.exception';

export function rpcToHttpException(error: unknown): HttpException {
  const payload: ErrorPayload = extractRpcError(error);

  return new HttpException(
    {
      code: httpStatusToCode(payload.httpCode),
      message: payload.message,
      metadata: payload.metadata,
    },
    payload.httpCode,
  );
}

export function HttpErrorHelper(err: unknown): never {
  const logger = new Logger('HttpErrorHelper');
  logger.error(err);
  if (isRpcExceptionResponse(err)) {
    throw rpcToHttpException(err);
  }
  throw err;
}
