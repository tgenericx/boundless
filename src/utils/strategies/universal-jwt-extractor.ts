import { Request } from 'express';
import { Logger } from '@nestjs/common';

const logger = new Logger('UniversalJwtExtractor');

/**
 * Extracts JWT tokens from multiple contexts:
 * - GraphQL variables (req.body.variables)
 * - REST request body (req.body.refreshToken)
 * - Headers (Authorization or x-refresh-token)
 * - Query parameters (?token=...)
 *
 * Works for both Access and Refresh JWTs.
 */
export const universalJwtExtractor = (req: Request): string | null => {
  if (!req) {
    logger.warn('Extractor called without a request object.');
    return null;
  }

  const body = req.body as Record<string, any>;
  const headers = req.headers as Record<string, string | string[] | undefined>;

  logger.debug(
    `Extractor invoked with keys: ${Object.keys(body || {}).join(', ')}`,
  );

  const authHeader = headers['authorization'] || headers['Authorization'];
  if (authHeader) {
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      logger.log('✅ Extracted token from Bearer Authorization header');
      return token;
    } else {
      logger.warn('⚠️ Authorization header exists but is not Bearer type.');
    }
  }

  const xRefresh = headers['x-refresh-token'];
  if (xRefresh && typeof xRefresh === 'string') {
    logger.log('✅ Extracted token from x-refresh-token header');
    return xRefresh;
  }

  if (body?.refreshToken && typeof body.refreshToken === 'string') {
    logger.log('✅ Extracted token from req.body.refreshToken');
    return body.refreshToken;
  }

  const vars = body?.variables as Record<string, any> | undefined;
  if (vars) {
    logger.debug(`GraphQL variables detected: ${JSON.stringify(vars)}`);

    if (typeof vars.refreshToken === 'string') {
      logger.log('✅ Extracted token from body.variables.refreshToken');
      return vars.refreshToken;
    }
    if (typeof vars.token === 'string') {
      logger.log('✅ Extracted token from body.variables.token');
      return vars.token;
    }
    if (typeof vars.args === 'string') {
      logger.log('✅ Extracted token from body.variables.args');
      return vars.args;
    }

    logger.warn('⚠️ GraphQL variables found but no token fields detected.');
  }

  const queryToken = (req.query as Record<string, unknown>)?.token;
  if (typeof queryToken === 'string') {
    logger.log('✅ Extracted token from query parameter (?token=...)');
    return queryToken;
  }

  logger.error('❌ No JWT token found in request. Extraction failed.');
  return null;
};
