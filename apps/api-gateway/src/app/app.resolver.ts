import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  root(): string {
    return 'Root query to satisfy GraphQL schema requirements';
  }
}
