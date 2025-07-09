import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { GraphQLErrorCode, HttpToGraphQLErrorMap } from './error-code.map';

@Catch(HttpException)
export class GraphqlExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GraphqlExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): GraphQLError {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();

    const rawResponse = exception.getResponse();
    const status = exception.getStatus();
    const graphqlCode =
      HttpToGraphQLErrorMap[status] || GraphQLErrorCode.InternalServerError;

    const response = (
      typeof rawResponse === 'object' && rawResponse !== null
        ? rawResponse
        : { message: exception.message }
    ) as {
      message?: string;
      metadata?: Record<string, unknown>;
      code?: string;
    };

    const requestId = context?.req?.headers?.['x-request-id'];

    this.logger.error(
      `GraphQL Exception: ${response.message || exception.message}`,
      JSON.stringify(response),
    );

    return new GraphQLError(response.message || 'Internal server error', {
      extensions: {
        code: graphqlCode,
        status: 'error',
        httpCode: status,
        requestId,
        metadata: response.metadata ?? null,
        errorCode: response.code ?? null,
      },
    });
  }
}
