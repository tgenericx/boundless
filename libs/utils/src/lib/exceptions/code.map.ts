import { HttpStatus } from '@nestjs/common';

export function httpStatusToCode(status: HttpStatus): string {
  return HttpStatus[status] ?? 'UNKNOWN_ERROR';
}
