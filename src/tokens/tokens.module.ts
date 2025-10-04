import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';
import * as path from 'path';
import * as fs from 'fs';
import { findRoot } from 'src/utils/find-root.util';
import { generateAndSaveKeys } from 'src/utils/generate-keys.util';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('JwtConfig');
        logger.log('🔑 Starting JWT key setup...');

        const loadKeys = (): { privateKey: string; publicKey: string } => {
          const root = findRoot(process.cwd());
          const secretsDir = path.join(root, 'secrets');
          const privatePath = path.join(secretsDir, 'private.pem');
          const publicPath = path.join(secretsDir, 'public.pem');

          logger.log(`📂 Project root: ${root}`);

          // 1. Try loading from files
          try {
            logger.log(`🔍 Looking for keys in: ${secretsDir}`);
            const privateKey = fs.readFileSync(privatePath, 'utf8');
            const publicKey = fs.readFileSync(publicPath, 'utf8');

            if (privateKey && publicKey) {
              logger.log('✅ Keys loaded from files');
              return { privateKey, publicKey };
            }
          } catch (error) {
            if (error instanceof Error) {
              logger.warn(
                `⚠️  Could not load keys from files: ${error.message}`,
              );
            }
          }

          // 2. Try environment variables
          logger.log('🌍 Checking environment variables...');
          const envPrivateKey = config.get<string>('JWT_PRIVATE_KEY');
          const envPublicKey = config.get<string>('JWT_PUBLIC_KEY');

          if (envPrivateKey && envPublicKey) {
            logger.log('✅ Keys loaded from environment variables');
            return { privateKey: envPrivateKey, publicKey: envPublicKey };
          }

          // 3. Generate new keys
          logger.warn('⚠️  No JWT keys found. Generating new RSA key pair...');
          generateAndSaveKeys();

          try {
            const privateKey = fs.readFileSync(privatePath, 'utf8');
            const publicKey = fs.readFileSync(publicPath, 'utf8');
            logger.log('✅ New keys generated and loaded');
            return { privateKey, publicKey };
          } catch (error) {
            if (error instanceof Error) {
              logger.error(
                `❌ Failed to generate or load new keys: ${error.message}`,
              );
            }
            throw new Error('JWT key setup failed');
          }
        };

        const { privateKey, publicKey } = loadKeys();
        logger.log('🎉 JWT key setup completed successfully');

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256',
            expiresIn: config.get<string>('ACCESS_TOKEN_EXPIRES_IN', '15m'),
          },
          verifyOptions: {
            algorithms: ['RS256'],
          },
        };
      },
    }),
  ],
  providers: [TokenService, RefreshTokenService],
  exports: [TokenService, RefreshTokenService, JwtModule],
})
export class TokensModule {}
