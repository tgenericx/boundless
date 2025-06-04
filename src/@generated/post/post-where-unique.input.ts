import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PostWhereInput } from './post-where.input';
import { StringNullableFilter } from '../prisma/string-nullable-filter.input';
import { StringNullableListFilter } from '../prisma/string-nullable-list-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';

@InputType()
export class PostWhereUniqueInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => [PostWhereInput], { nullable: true })
  AND?: Array<PostWhereInput>;

  @Field(() => [PostWhereInput], { nullable: true })
  OR?: Array<PostWhereInput>;

  @Field(() => [PostWhereInput], { nullable: true })
  NOT?: Array<PostWhereInput>;

  @Field(() => StringNullableFilter, { nullable: true })
  textContent?: StringNullableFilter;

  @Field(() => StringNullableListFilter, { nullable: true })
  mediaUrls?: StringNullableListFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  createdAt?: DateTimeFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  updatedAt?: DateTimeFilter;
}
