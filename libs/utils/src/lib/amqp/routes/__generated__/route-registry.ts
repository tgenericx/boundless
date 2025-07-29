// 🚨 AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.

import { AuthRoutes } from '../auth.routes';

export const RouteRegistry = {
  "auth": AuthRoutes,
} as const;

export type RegisteredService = keyof typeof RouteRegistry;
export type RegisteredRouteName<S extends RegisteredService> = keyof typeof RouteRegistry[S];
