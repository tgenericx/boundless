import { createJwtConfigFactory } from './create-jwt-config';

export const accessJwtConfigFactory = createJwtConfigFactory('access-', '15m');
