import { HttpException } from '@nestjs/common';
import { TransportResponse } from '../../../types';

type ExceptionResponse = {
  message?: string | string[];
  error?: string;
  [key: string]: unknown;
};

export function formatNestJsError(
  error: unknown,
): TransportResponse<never> | undefined {
  if (!(error instanceof HttpException)) return;

  const response = error.getResponse();
  let message: string;
  let nestMeta: Record<string, unknown> | undefined;

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

    nestMeta = Object.keys(res).reduce<Record<string, unknown>>((acc, key) => {
      if (key !== 'message' && key !== 'error') {
        acc[key] = res[key];
      }
      return acc;
    }, {});
    delete nestMeta.message;
    delete nestMeta.error;
  }

  return {
    success: false,
    error: {
      type: 'HttpException',
      message,
      code: `HTTP_${error.getStatus()}`,
      httpStatus: error.getStatus(),
      meta: nestMeta ? { nest: nestMeta } : undefined,
    },
  };
}
