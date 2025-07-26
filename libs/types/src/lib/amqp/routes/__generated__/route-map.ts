// 🚨 AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { AuthRoutes } from '../auth.routes';

export const Routes = {
  "auth": AuthRoutes,
} as const;

export type RegisteredService = keyof typeof Routes;
export type RegisteredRouteName<S extends RegisteredService> = keyof typeof Routes[S];
