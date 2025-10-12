import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { loadOrGenerateKeys } from './jwt-utils';
import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

export interface JwtKeyConfig {
  privateKey: string;
  publicKey: string;
  signOptions: JwtSignOptions;
  verifyOptions: JwtVerifyOptions;
}

export type TimeUnit = `${number}${'s' | 'm' | 'h' | 'd'}`;

/**
 * Creates a reusable factory for generating JWT configs.
 * Each factory handles key loading/generation, expiry normalization, and configuration merging.
 */
export function createJwtConfigFactory(
  keyPrefix: string,
  defaultExpiresIn: TimeUnit,
) {
  return (config: ConfigService): JwtKeyConfig => {
    const logger = new Logger(`${keyPrefix.toUpperCase()}JWT`);
    const { privateKey, publicKey } = loadOrGenerateKeys(logger, keyPrefix);

    const envKey =
      keyPrefix === 'refresh-'
        ? 'REFRESH_TOKEN_EXPIRES_IN'
        : 'ACCESS_TOKEN_EXPIRES_IN';

    const expiresInValue = config.get<string>(envKey, defaultExpiresIn);

    const expiresIn: TimeUnit | number = /^\d+[smhd]$/.test(expiresInValue)
      ? (expiresInValue as TimeUnit)
      : parseFallback(defaultExpiresIn);

    return {
      privateKey,
      publicKey,
      signOptions: { algorithm: 'RS256', expiresIn },
      verifyOptions: { algorithms: ['RS256'] },
    };
  };
}

/**
 * Parses a string like "15m" or "7d" into a numeric fallback in seconds.
 */
function parseFallback(time: TimeUnit): number {
  const match = /^(\d+)([smhd])$/.exec(time);
  if (!match) return 3600;
  const [, num, unit] = match;
  const multiplier =
    unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return Number(num) * multiplier;
}
