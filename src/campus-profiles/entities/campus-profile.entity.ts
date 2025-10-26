import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class CampusProfile {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
