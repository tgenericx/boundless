import {
  ExchangeOperation,
  ExchangeOperationConfig,
} from './exchange.constants';
import { ServiceExchange } from './exchange.types';

export const defineExchange = (
  service: string,
  operation: ExchangeOperation,
): ServiceExchange => {
  const config = ExchangeOperationConfig[operation];

  return {
    name: `${service}.${operation}s`,
    type: config.type,
    operation,
  };
};
