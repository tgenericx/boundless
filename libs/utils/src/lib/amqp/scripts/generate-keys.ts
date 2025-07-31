import { generateKeyPairSync } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { findMonorepoRoot } from './find-monorepo-root';

function generateAndSaveKeys() {
  const monorepoRoot = findMonorepoRoot(__dirname);
  const secretsDir = path.join(monorepoRoot, '../../secrets');

  if (!fs.existsSync(secretsDir)) {
    fs.mkdirSync(secretsDir, { recursive: true });
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

  const privatePath = path.join(secretsDir, 'private.pem');
  const publicPath = path.join(secretsDir, 'public.pem');

  fs.writeFileSync(privatePath, privateKey);
  fs.writeFileSync(publicPath, publicKey);

  console.log('✅ RSA keys generated successfully:');
  console.log(`🔐 Private Key: ${privatePath}`);
  console.log(`🔓 Public Key:  ${publicPath}`);
}

generateAndSaveKeys();
