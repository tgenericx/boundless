import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAccessTokenPayload } from '@/types';
import { type AuthenticatedUser } from '@/types';
import { loadOrGenerateKeys } from '@/tokens/jwt/jwt-utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const logger = new Logger(JwtStrategy.name);
    const { publicKey } = loadOrGenerateKeys(logger, 'access-');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      ignoreExpiration: false,
    });
  }

  validate(payload: IAccessTokenPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      roles: payload.roles,
    };
  }
}
