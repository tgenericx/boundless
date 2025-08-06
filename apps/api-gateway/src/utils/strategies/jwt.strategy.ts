import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { IAccessTokenPayload } from '@boundless/types/interfaces';
import { findMonorepoRoot } from '@boundless/utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    const root = findMonorepoRoot(process.cwd());
    let secretOrKey: string;

    try {
      secretOrKey = fs.readFileSync(
        path.join(root, 'secrets/public.pem'),
        'utf8',
      );
    } catch {
      secretOrKey = config.get<string>('JWT_PUBLIC_KEY', '');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
      algorithms: ['RS256'],
      ignoreExpiration: false,
    });
  }

  async validate(payload: IAccessTokenPayload) {
    return {
      userId: payload.sub,
      roles: payload.roles,
    };
  }
}
