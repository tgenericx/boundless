import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/@generated/schema.gql'),
      sortSchema: true,
      introspection: true,
      path: '/api/graphql',
      subscriptions: {
        'graphql-ws': {
          path: '/api/graphql',
        },
      },
      graphiql: {
        shouldPersistHeaders: true,
      },
    }),
  ],
})
export class GqlModule {}
