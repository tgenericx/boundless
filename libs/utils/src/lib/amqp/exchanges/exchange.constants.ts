export const OperationExchangeTypeMap = {
  command: { type: 'direct' },
  query: { type: 'direct' },
  event: { type: 'topic' },
  broadcast: { type: 'fanout' },
} as const;

export type ExchangeOperation = keyof typeof OperationExchangeTypeMap;
export type ExchangeType =
  (typeof OperationExchangeTypeMap)[ExchangeOperation]['type'];
