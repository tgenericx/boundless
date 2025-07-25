export const ExchangeOperationConfig = {
  command: { type: 'direct' },
  query: { type: 'direct' },
  event: { type: 'topic' },
  broadcast: { type: 'fanout' },
} as const;

export type ExchangeOperation = keyof typeof ExchangeOperationConfig;
export type ExchangeType =
  (typeof ExchangeOperationConfig)[ExchangeOperation]['type'];
