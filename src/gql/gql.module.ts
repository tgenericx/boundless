import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { GraphQLFormattedError } from 'graphql';

interface IGraphQLFormattedError {
  message: string;
  code: object;
}

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/gql/schema.gql'),
      sortSchema: true,
      subscriptions: {
        'graphql-ws': true,
      },
      graphiql: true,
      formatError: (error: GraphQLFormattedError): IGraphQLFormattedError => {
        const originalError = error.extensions?.originalError as Error;
        if (!originalError) {
          return {
            message: error.message,
            code: error.extensions?.code || 'UNKNOWN_ERROR',
          };
        }
        return {
          message: originalError.message,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        };
      },
    }),
  ],
})
export class GqlModule { }
