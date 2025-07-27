import { defineRoute } from './define-route';
import { getExchange } from '../exchanges';

export const AuthRoutes = {
  userRegister: defineRoute(getExchange('auth', 'command'))('user.register', {
    description: 'User registration command',
  }),
  userRegistered: defineRoute(getExchange('auth', 'event'))('user.registered', {
    description: 'User registered event',
  }),
};
