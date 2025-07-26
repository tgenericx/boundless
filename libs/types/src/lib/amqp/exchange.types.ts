import { ExchangeType, ExchangeOperation } from './exchange.constants';

export type ServiceName = string;

export type ExchangeName = `${ServiceName}.${ExchangeOperation}s`;

export interface ServiceExchange {
  name: ExchangeName;
  type: ExchangeType;
  operation: ExchangeOperation;
}
