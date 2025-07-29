import { User } from '@boundless/types/prisma';

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}
