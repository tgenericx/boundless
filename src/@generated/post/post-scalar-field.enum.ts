import { registerEnumType } from '@nestjs/graphql';

export enum PostScalarFieldEnum {
  id = 'id',
  textContent = 'textContent',
  mediaUrls = 'mediaUrls',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

registerEnumType(PostScalarFieldEnum, {
  name: 'PostScalarFieldEnum',
  description: undefined,
});
