import { GraphQLError } from 'graphql';
import { HttpStatus } from '@nestjs/common';
import { reviveDateInData } from './revive-date';
import {
  isTransportSuccess,
  TransportError,
  TransportResponse,
} from '../../types';

export class GraphQLResponseHelper {
  private static httpStatusToCode(status: HttpStatus): string {
    return HttpStatus[status] ?? 'UNKNOWN_ERROR';
  }

  static async fromAmqpResponse<T>(response: TransportResponse<T>): Promise<T> {
    if (isTransportSuccess(response)) return await response.data;
    throw this.fromAmqpError(response.error);
  }

  static fromAmqpError(error: TransportError): GraphQLError {
    const extensions: Record<string, unknown> = {
      code: this.httpStatusToCode(
        error.httpStatus ?? HttpStatus.INTERNAL_SERVER_ERROR,
      ),
      httpStatus: error.httpStatus,
      type: error.type,
      meta: error.meta,
      target: error.target,
    };

    if (error.originalError && typeof error.originalError === 'object') {
      extensions.originalError = error.originalError;
    }

    return new GraphQLError(error.message, { extensions });
  }
}

export async function withDatesRevived<T>(
  response: TransportResponse<T>,
): Promise<T> {
  return GraphQLResponseHelper.fromAmqpResponse(response).then(
    reviveDateInData,
  );
}
