import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { extractRpcError } from './extract';
import { httpStatusToCode } from './code.map';
import { ErrorPayload } from '../interfaces/error-payload.interface';

export function rpcToHttpException(error: unknown): HttpException {
  const payload: ErrorPayload = extractRpcError(error);

  return new HttpException(
    {
      code: httpStatusToCode(payload.httpCode),
      message: payload.message,
      metadata: payload.metadata,
    },
    payload.httpCode
  );
}

@Catch()
export class HttpAppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: unknown = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error occurred',
    };

    // RPC-like error format
    try {
      const payload = extractRpcError(exception);
      httpStatus = payload.httpCode;
      responseBody = {
        code: httpStatusToCode(payload.httpCode),
        message: payload.message,
        metadata: payload.metadata,
      };
    } catch {
      // fallback if not ErrorPayload-compatible
      if (exception instanceof HttpException) {
        httpStatus = exception.getStatus();
        const resBody = exception.getResponse();
        responseBody =
          typeof resBody === 'string' ? { message: resBody } : resBody;
      }
    }

    res.status(httpStatus).json(responseBody);
  }
}
