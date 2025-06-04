import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { StringNullableWithAggregatesFilter } from '../prisma/string-nullable-with-aggregates-filter.input';
import { StringNullableListFilter } from '../prisma/string-nullable-list-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';

@InputType()
export class PostScalarWhereWithAggregatesInput {
  @Field(() => [PostScalarWhereWithAggregatesInput], { nullable: true })
  AND?: Array<PostScalarWhereWithAggregatesInput>;

  @Field(() => [PostScalarWhereWithAggregatesInput], { nullable: true })
  OR?: Array<PostScalarWhereWithAggregatesInput>;

  @Field(() => [PostScalarWhereWithAggregatesInput], { nullable: true })
  NOT?: Array<PostScalarWhereWithAggregatesInput>;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  id?: StringWithAggregatesFilter;

  @Field(() => StringNullableWithAggregatesFilter, { nullable: true })
  textContent?: StringNullableWithAggregatesFilter;

  @Field(() => StringNullableListFilter, { nullable: true })
  mediaUrls?: StringNullableListFilter;

  @Field(() => DateTimeWithAggregatesFilter, { nullable: true })
  createdAt?: DateTimeWithAggregatesFilter;

  @Field(() => DateTimeWithAggregatesFilter, { nullable: true })
  updatedAt?: DateTimeWithAggregatesFilter;
}
