import { createJwtConfigFactory } from './create-jwt-config';

export const refreshJwtConfigFactory = createJwtConfigFactory('refresh-', '7d');
