import { defineExchange } from '../define-exchange';

export const Exchanges = {
  auth: {
    command: defineExchange('auth', 'command'),
    event: defineExchange('auth', 'event'),
  },
  post: {
    command: defineExchange('user', 'command'),
    event: defineExchange('user', 'event'),
  },
  notification: {
    command: defineExchange('notification', 'command'),
    broadcast: defineExchange('notification', 'broadcast'),
  },
} as const;

export type RegisteredService = keyof typeof Exchanges;
export type RegisteredExchangeType =
  keyof (typeof Exchanges)[RegisteredService];
