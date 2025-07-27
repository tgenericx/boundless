import { HttpStatus } from '@nestjs/common';

export interface ErrorPayload {
  httpCode: HttpStatus;
  message: string;
  metadata?: Record<string, unknown>;
}
