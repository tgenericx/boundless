import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IRefreshTokenPayload } from '@/types';
import { loadOrGenerateKeys } from '@/tokens/jwt/jwt-utils';
import { universalJwtExtractor } from './universal-jwt-extractor';

/**
 * Strategy for validating refresh tokens signed with the refresh keypair.
 */
@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor() {
    const logger = new Logger(RefreshJwtStrategy.name);
    const { publicKey } = loadOrGenerateKeys(logger, 'refresh-');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([universalJwtExtractor]),
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      ignoreExpiration: false,
    });
  }

  validate(payload: IRefreshTokenPayload) {
    return {
      sub: payload.sub,
      jti: payload.jti,
    };
  }
}
