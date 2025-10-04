import { generateKeyPairSync } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { findRoot } from './find-root.util';

/**
 * Generates and saves RSA private and public keys for JWT authentication.
 *
 * - Keys are stored in the `secrets/` directory at the project root.
 * - By default, the function is idempotent: if keys already exist, they are preserved.
 * - You can override this behavior by passing `force = true` to regenerate the keys.
 * - File permissions for the private key are restricted (`0600`) for security.
 *
 * @param force - If `true`, existing keys will be overwritten. Default is `false`.
 * @returns void
 *
 * @example
 * ```ts
 * // Generate keys if they don't exist
 * generateAndSaveKeys();
 *
 * // Force regeneration of keys
 * generateAndSaveKeys(true);
 * ```
 */
export function generateAndSaveKeys(force = false): void {
  const root = findRoot(__dirname);
  const secretsDir = path.join(root, 'secrets');

  if (!fs.existsSync(secretsDir)) {
    fs.mkdirSync(secretsDir, { recursive: true });
  }

  const privatePath = path.join(secretsDir, 'private.pem');
  const publicPath = path.join(secretsDir, 'public.pem');

  // Skip generation if keys already exist (unless force = true)
  if (!force && fs.existsSync(privatePath) && fs.existsSync(publicPath)) {
    console.log('⚠️ Keys already exist, skipping generation.');
    console.log(`🔐 Private Key: ${privatePath}`);
    console.log(`🔓 Public Key:  ${publicPath}`);
    return;
  }

  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  fs.writeFileSync(privatePath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicPath, publicKey);

  console.log('✅ RSA keys generated successfully:');
  console.log(`🔐 Private Key: ${privatePath}`);
  console.log(`🔓 Public Key:  ${publicPath}`);
}
