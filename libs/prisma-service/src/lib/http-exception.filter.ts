import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception.getResponse();

    const payload = (
      typeof raw === 'object' && raw !== null
        ? raw
        : { message: exception.message }
    ) as {
      message?: string;
      code?: string;
      metadata?: Record<string, unknown>;
    };

    this.logger.error(
      `HTTP Exception: ${payload.message || exception.message}`,
      JSON.stringify(payload),
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      method: request.method,
      message: payload.message || 'Internal server error',
      errorCode: payload.code ?? null,
      metadata: payload.metadata ?? null,
      timestamp: new Date().toISOString(),
    });
  }
}
