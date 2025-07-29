import { User } from '@boundless/types/prisma';

export interface IAuthPayload {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}
