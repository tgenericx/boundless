import { generateKeyPairSync } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { findRoot } from './find-root';

function generateAndSaveKeys() {
  const root = findRoot(__dirname);
  const secretsDir = path.join(root, 'secrets');

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
