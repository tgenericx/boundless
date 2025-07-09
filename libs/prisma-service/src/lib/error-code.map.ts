import { HttpStatus } from '@nestjs/common';

export enum GraphQLErrorCode {
  Conflict = 'CONFLICT',
  NotFound = 'NOT_FOUND',
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
}

export const HttpToGraphQLErrorMap: Record<number, GraphQLErrorCode> = {
  [HttpStatus.CONFLICT]: GraphQLErrorCode.Conflict,
  [HttpStatus.NOT_FOUND]: GraphQLErrorCode.NotFound,
  [HttpStatus.BAD_REQUEST]: GraphQLErrorCode.BadRequest,
  [HttpStatus.UNAUTHORIZED]: GraphQLErrorCode.Unauthorized,
  [HttpStatus.FORBIDDEN]: GraphQLErrorCode.Forbidden,
  [HttpStatus.INTERNAL_SERVER_ERROR]: GraphQLErrorCode.InternalServerError,
};
