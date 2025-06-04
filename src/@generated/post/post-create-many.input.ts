import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PostCreatemediaUrlsInput } from './post-createmedia-urls.input';

@InputType()
export class PostCreateManyInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  textContent?: string;

  @Field(() => PostCreatemediaUrlsInput, { nullable: true })
  mediaUrls?: PostCreatemediaUrlsInput;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;
}
