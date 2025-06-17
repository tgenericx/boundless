import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { GraphQLFormattedError } from 'graphql';
import { GqlCustomError } from 'src/common/errors/gql-custom.error';

interface IGraphQLFormattedError {
  error?: string;
  message: string;
  code: object;
  status: unknown;
}

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/@generated/schema.gql'),
      sortSchema: true,
      introspection: true,
      subscriptions: {
        'graphql-ws': {
          path: '/graphql',
        },
      },
      graphiql: true,
      formatError: (error: GraphQLFormattedError): IGraphQLFormattedError => {
        const originalError = error.extensions?.originalError;

        if (originalError instanceof GqlCustomError) {
          return {
            error: originalError.error,
            message: originalError.message,
            code:
              originalError.code ||
              error.extensions?.code ||
              'INTERNAL_SERVER_ERROR',
            status: originalError.status || error.extensions?.status,
          };
        }

        return {
          message: error.message,
          code: error.extensions?.code || 'UNKNOWN_ERROR',
          status: error.extensions?.status,
        };
      },
    }),
  ],
})
export class GqlModule {}
