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

  static async fromTransportResponse<T>(
    response: TransportResponse<T>,
  ): Promise<T> {
    if (isTransportSuccess(response)) return response.data;
    throw this.fromTransportError(response.error);
  }

  static fromTransportError(error: TransportError): GraphQLError {
    const extensions: Record<string, unknown> = {
      code: this.httpStatusToCode(
        error.httpStatus ?? HttpStatus.INTERNAL_SERVER_ERROR,
      ),
      httpStatus: error.httpStatus,
      type: error.type,
      meta: error.meta,
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
  return GraphQLResponseHelper.fromTransportResponse(response).then(
    reviveDateInData,
  );
}
