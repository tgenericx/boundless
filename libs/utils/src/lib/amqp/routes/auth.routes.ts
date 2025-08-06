import { ExchangeRegistry } from '../exchanges/registry';
import { defineRoute } from './define-route';

const exchange = ExchangeRegistry.auth;

export const AuthRoutes = {
  registerUser: defineRoute(exchange.command)('user.register', {
    description: 'Initiates user registration process',
    tags: ['registration', 'user'],
  }),
  loginUser: defineRoute(exchange.command)('user.login', {
    description: 'Handles user authentication',
    tags: ['authentication'],
  }),
  refreshAuthToken: defineRoute(exchange.command)('token.refresh', {
    description: 'Generates new access token using refresh token',
    tags: ['authentication', 'tokens'],
  }),
  logoutUser: defineRoute(exchange.command)('user.logout', {
    description:
      'Terminates user session and invalidates authentication tokens',
    tags: ['authentication'],
  }),

  userRegistered: defineRoute(exchange.event)('user.registered', {
    description: 'Emitted after successful user registration',
    tags: ['registration', 'user'],
  }),
  userLoggedIn: defineRoute(exchange.event)('user.loggedIn', {
    description: 'Emitted after successful authentication',
    tags: ['authentication'],
  }),
  authTokenRefreshed: defineRoute(exchange.event)('token.refreshed', {
    description: 'Emitted when new tokens are generated',
    tags: ['authentication', 'tokens'],
  }),
  userLoggedOut: defineRoute(exchange.event)('user.loggedOut', {
    description: 'Emitted after successful session termination',
    tags: ['authentication', 'session'],
  }),
  getUserById: defineRoute(exchange.command)('user.getById', {
    description: 'Fetch user details by userId',
    tags: ['user', 'details'],
  }),
};
