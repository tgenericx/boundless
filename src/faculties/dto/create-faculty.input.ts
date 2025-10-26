import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateFacultyInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
