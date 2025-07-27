import { HttpException } from '@nestjs/common';
import { AmqpResponse } from '../amqp.types';

type ExceptionResponse = {
  message?: string | string[];
  error?: string;
  [key: string]: unknown;
};

export function formatNestJsError(
  error: unknown,
): AmqpResponse<never> | undefined {
  if (!(error instanceof HttpException)) return;

  const response = error.getResponse();
  let message: string;
  let meta: Record<string, unknown> | undefined;

  if (typeof response === 'string') {
    message = response;
  } else {
    const res = response as ExceptionResponse;
    message =
      typeof res.message === 'string'
        ? res.message
        : Array.isArray(res.message)
          ? res.message.join(', ')
          : res.error || error.message;

    meta = { ...res };
    delete meta.message;
    delete meta.error;
  }

  return {
    success: false,
    error: {
      type: 'HttpException',
      message,
      code: `HTTP_${error.getStatus()}`,
      httpStatus: error.getStatus(),
      meta: Object.keys(meta || {}).length ? meta : undefined,
    },
  };
}
