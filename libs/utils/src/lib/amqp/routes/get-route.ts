import {
  RegisteredRouteName,
  RegisteredService,
  Routes,
} from './__generated__/route-map';

export function getRoute<
  S extends RegisteredService,
  R extends RegisteredRouteName<S>,
>(service: S, route: R) {
  return Routes[service][route];
}
