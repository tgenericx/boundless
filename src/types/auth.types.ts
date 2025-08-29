import { User } from '@prisma/client';

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
