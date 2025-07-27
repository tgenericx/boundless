import {
  ExchangeOperation,
  OperationExchangeTypeMap,
} from './exchange.constants';
import { ServiceExchange } from './exchange.types';

export const defineExchange = (
  service: string,
  operation: ExchangeOperation,
): ServiceExchange => {
  const getOperation = OperationExchangeTypeMap[operation];

  return {
    name: `${service}.${operation}s`,
    type: getOperation.type,
    operation,
  };
};
