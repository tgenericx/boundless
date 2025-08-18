import { defineExchange } from './define-exchange';

export const ExchangeRegistry = {
  auth: {
    command: defineExchange('auth', 'command'),
    event: defineExchange('auth', 'event'),
  },
  user: {
    command: defineExchange('user', 'command'),
    event: defineExchange('user', 'event'),
  },
  notification: {
    command: defineExchange('notification', 'command'),
    broadcast: defineExchange('notification', 'broadcast'),
  },
} as const;

export type RegisteredService = keyof typeof ExchangeRegistry;
export type RegisteredExchangeType =
  keyof (typeof ExchangeRegistry)[RegisteredService];
