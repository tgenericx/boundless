import { User } from '@boundless/types/prisma';

export interface IAuthPayload {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
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
