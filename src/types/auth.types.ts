import { User } from 'generated/prisma';

export interface IAuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface IAccessTokenPayload {
  sub: User['id'];
  roles: User['roles'];
}

export type VerifiedToken<T = unknown> = {
  iat?: number;
  exp?: number;
} & T;

export interface AuthenticatedUser {
  userId: User['id'];
  roles: User['roles'];
}

export interface OwnershipStep<TResource extends Record<string, any>> {
  resourceName: string;
  ownerField: keyof TResource;
  findResourceById: (id: string) => Promise<TResource | null>;
  parentIdField?: keyof TResource;
}

export type OwnershipChain<TResources extends readonly Record<string, any>[]> =
  {
    [K in keyof TResources]: TResources[K] extends Record<string, any>
      ? OwnershipStep<TResources[K]>
      : never;
  };

export interface IdArgs<IDType = string> {
  where?: { id?: IDType };
  id?: IDType;
}
