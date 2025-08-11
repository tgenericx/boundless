import { HttpStatus } from '@nestjs/common';

export interface RpcErrorPayload {
  httpCode: HttpStatus;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface RpcExceptionPayload extends RpcErrorPayload {
  nestjsSpecific?: {
    context?: string;
    statusCode?: HttpStatus;
  };
}
