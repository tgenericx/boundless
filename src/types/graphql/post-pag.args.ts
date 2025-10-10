import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from '@/generated/graphql';

@ArgsType()
export class TimelinePagArgs {
  @Field({ nullable: true })
  after?: string;

  @Field({ nullable: true })
  before?: string;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;

  @Field(() => Date, { nullable: true })
  since?: Date;
}

@ObjectType()
export class PageInfo {
  @Field({ nullable: true })
  endCursor?: string;

  @Field({ nullable: true })
  startCursor?: string;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

@ObjectType()
export class TimelinePosts {
  @Field(() => [Post])
  items: Post[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
