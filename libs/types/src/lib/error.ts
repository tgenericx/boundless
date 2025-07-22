import { GraphQLError } from 'graphql';
import { HttpStatus } from '@nestjs/common';
import { AmqpError, AmqpResponse, isAmqpSuccess } from './amqp';

export class GraphQLResponseHelper {
  /**
   * Convert HTTP status to a readable code (e.g., 404 → "NOT_FOUND").
   */
  private static httpStatusToCode(status: HttpStatus): string {
    return HttpStatus[status] ?? 'UNKNOWN_ERROR';
  }

  /**
   * Convert AmqpResponse to GraphQL result or error.
   */
  static async fromAmqpResponse<T>(response: AmqpResponse<T>): Promise<T> {
    if (isAmqpSuccess(response)) return await response.data;
    throw this.fromAmqpError(response.error);
  }

  /**
   * Convert AmqpError to GraphQLError with HTTP status extensions.
   */
  static fromAmqpError(error: AmqpError): GraphQLError {
    return new GraphQLError(error.message, {
      extensions: {
        code: this.httpStatusToCode(
          error.httpStatus ?? HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        httpStatus: error.httpStatus,
        type: error.type,
        meta: error.meta,
        target: error.target,
        ...(error.originalError && { originalError: error.originalError }),
      },
    });
  }
}
