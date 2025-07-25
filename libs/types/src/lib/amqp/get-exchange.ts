import { SERVICE_EXCHANGE_MAP } from './exchange.config';
import { ExchangeOperation } from './exchange.constants';
import { ServiceExchange, ServiceName } from './exchange.types';

export function getExchange(
  service: ServiceName,
  operation: ExchangeOperation,
): ServiceExchange {
  const serviceConfig = SERVICE_EXCHANGE_MAP[service];

  if (!serviceConfig) {
    throw new Error(`Exchange config not found for service: ${service}`);
  }

  const exchange = serviceConfig[operation];
  if (!exchange) {
    throw new Error(
      `Exchange not defined for operation: "${operation}" in service: "${service}"`,
    );
  }

  return exchange;
}

export function getExchangesByServices(
  services: ServiceName[],
): ServiceExchange[] {
  return services.flatMap((service) =>
    Object.values(SERVICE_EXCHANGE_MAP[service] || []),
  );
}
