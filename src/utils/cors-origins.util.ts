import { ConfigService } from '@nestjs/config';

export function getCorsOrigins(
  configService: ConfigService,
  env: string,
): string[] {
  const definedCorsOrigins: string[] = (
    configService.get<string>('CORS_ORIGIN') ?? ''
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return env === 'production'
    ? definedCorsOrigins
    : ['http://localhost:3000', ...definedCorsOrigins];
}
