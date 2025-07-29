import { ExchangeRegistry } from '../exchanges/registry';
import { defineRoute } from './define-route';

const exchange = ExchangeRegistry.auth;

export const AuthRoutes = {
  userRegister: defineRoute(exchange.command)('user.register', {
    description: 'User registration command',
  }),
  userRegistered: defineRoute(exchange.event)('user.registered', {
    description: 'User registered event',
  }),
  authToken: defineRoute(exchange.command)('auth.token.refresh'),
};
