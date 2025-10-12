import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { findRoot } from '@/utils/find-root.util';
import { generateAndSaveKeys } from '@/utils/generate-keys.util';

/**
 * Load existing keypair or generate a new one if missing.
 *
 * @param logger - NestJS Logger instance
 * @param prefix - Optional key prefix (e.g. "access-" or "refresh-")
 */
export const loadOrGenerateKeys = (
  logger: Logger,
  prefix = '',
): { privateKey: string; publicKey: string } => {
  const root = findRoot(process.cwd());
  const normalizedPrefix = prefix.replace(/-+$/, '');
  const subDir = path.join('secrets', normalizedPrefix);
  const secretsDir = path.join(root, subDir);

  const privatePath = path.join(secretsDir, `${normalizedPrefix}-private.pem`);
  const publicPath = path.join(secretsDir, `${normalizedPrefix}-public.pem`);

  try {
    const privateKey = fs.readFileSync(privatePath, 'utf8');
    const publicKey = fs.readFileSync(publicPath, 'utf8');
    logger.log(`✅ Keys loaded from ${secretsDir}`);
    return { privateKey, publicKey };
  } catch (err) {
    logger.warn(`⚠️ Keys not found in ${secretsDir}: ${err}`);
  }

  logger.warn(
    `⚠️ No keys found for prefix="${prefix}". Generating new keypair...`,
  );
  generateAndSaveKeys(prefix, normalizedPrefix);

  const privateKey = fs.readFileSync(privatePath, 'utf8');
  const publicKey = fs.readFileSync(publicPath, 'utf8');
  logger.log(`✅ New keys generated at ${secretsDir}`);

  return { privateKey, publicKey };
};
