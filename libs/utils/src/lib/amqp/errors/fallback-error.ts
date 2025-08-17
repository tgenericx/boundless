import { HttpStatus } from '@nestjs/common';
import { TransportResponse } from '../../../types';

export function formatFallbackError(error: unknown): TransportResponse<never> {
  return {
    success: false,
    error: {
      type: 'UnknownError',
      message:
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      meta:
        error instanceof Error
          ? { stack: error.stack }
          : { original: safeStringify(error, 2048) },
    },
  };
}

function safeStringify(input: unknown, maxLen = 4096): string {
  const seen = new WeakSet<object>();
  const replacer = (_key: string, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value as object)) return '[Circular]';
      seen.add(value as object);
    }
    if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
    if (value instanceof Error) {
      return { name: value.name, message: value.message, stack: value.stack };
    }
    return value as unknown as string;
  };
  let out: string;
  try {
    out = JSON.stringify(input, replacer, 2);
  } catch {
    try {
      out = String(input);
    } catch {
      out = '[Unserializable]';
    }
  }
  if (out.length > maxLen) {
    out = out.slice(0, maxLen) + '…[truncated]';
  }
  return out;
}
