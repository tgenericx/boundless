import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class TimelinePaginationArgs {
  @Field({ nullable: true })
  after?: string;

  @Field({ nullable: true })
  before?: string;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;

  @Field(() => Date, { nullable: true })
  since?: Date;
}
