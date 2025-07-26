import { Exchanges } from './exchanges';

export function getExchange<
  S extends keyof typeof Exchanges,
  T extends keyof (typeof Exchanges)[S],
>(service: S, type: T): (typeof Exchanges)[S][T] {
  return Exchanges[service][type];
}
