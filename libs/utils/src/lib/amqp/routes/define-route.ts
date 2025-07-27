import { ServiceExchange } from '../exchanges/exchange.types';

export type RouteMetadata = {
  description: string;
  tags?: string[];
} & Record<string, unknown>;

export const defineRoute =
  (exchange: ServiceExchange) => (queue: string, metadata?: RouteMetadata) => ({
    exchange: `${exchange.name}`,
    queue: `${exchange.name}.${queue}`,
    routingKey: `${queue}.${exchange.operation}`,
    ...metadata,
  });
