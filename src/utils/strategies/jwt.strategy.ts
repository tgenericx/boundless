import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { IAccessTokenPayload } from 'src/types';
import { findRoot } from 'src/utils/find-root';
import { AuthenticatedUser } from 'src/types/graphql';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    const root = findRoot(process.cwd());
    let secretOrKey: string;

    try {
      secretOrKey = fs.readFileSync(
        path.join(root, 'secrets/public.pem'),
        'utf8',
      );
    } catch (error) {
      console.warn(
        'Failed to read public key file, falling back to config:',
        error,
      );
      secretOrKey = config.get<string>('JWT_PUBLIC_KEY', '');
      if (!secretOrKey) {
        throw new Error('No JWT public key available from file or config');
      }
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
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
