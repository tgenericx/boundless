import { Request } from 'express';
import { Logger } from '@nestjs/common';

const logger = new Logger('RefreshTokenExtractor');

/**
 * Extracts ONLY refresh tokens from multiple contexts:
 * - GraphQL variables (req.body.variables.refreshToken)
 * - REST request body (req.body.refreshToken)
 * - Headers (x-refresh-token specifically)
 * - Query parameters (?refreshToken=...)
 *
 * Explicitly ignores Bearer tokens and access token locations.
 */
export const refreshTokenExtractor = (req: Request): string | null => {
  if (!req) {
    logger.warn('Extractor called without a request object.');
    return null;
  }

  const body = req.body as Record<string, any>;
  const headers = req.headers as Record<string, string | string[] | undefined>;

  logger.debug(
    `Refresh token extractor invoked with keys: ${Object.keys(body || {}).join(', ')}`,
  );

  const xRefresh = headers['x-refresh-token'];
  if (xRefresh && typeof xRefresh === 'string') {
    logger.log('✅ Extracted refresh token from x-refresh-token header');
    return xRefresh;
  }

  if (body?.refreshToken && typeof body.refreshToken === 'string') {
    logger.log('✅ Extracted refresh token from req.body.refreshToken');
    return body.refreshToken;
  }

  const vars = body?.variables as Record<string, any> | undefined;
  if (vars) {
    logger.debug(`GraphQL variables detected: ${JSON.stringify(vars)}`);

    if (typeof vars.refreshToken === 'string') {
      logger.log('✅ Extracted refresh token from body.variables.refreshToken');
      return vars.refreshToken;
    }
  }

  const queryRefreshToken = (req.query as Record<string, unknown>)
    ?.refreshToken;
  if (typeof queryRefreshToken === 'string') {
    logger.log(
      '✅ Extracted refresh token from query parameter (?refreshToken=...)',
    );
    return queryRefreshToken;
  }

  logger.error('❌ No refresh token found in request. Extraction failed.');
  return null;
};
