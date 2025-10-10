import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/generated/prisma';
import { IAccessTokenPayload, VerifiedToken } from 'src/types';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(private readonly jwt: JwtService) {}

  generateAccessToken(user: Pick<User, 'id' | 'roles'>): string {
    try {
      const payload: IAccessTokenPayload = {
        sub: user.id,
        roles: user.roles,
      };
      return this.jwt.sign(payload);
    } catch (error) {
      this.logger.error('Failed to generate access token', error);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  generateToken(user: Pick<User, 'id'>): string {
    try {
      const payload = {
        sub: user.id,
      };
      return this.jwt.sign(payload, {
        expiresIn: '24h',
      });
    } catch (error) {
      this.logger.error('Failed to generate access token', error);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  verify<T = IAccessTokenPayload>(token: string): VerifiedToken<T> {
    try {
      return this.jwt.verify(token);
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  decode<T = IAccessTokenPayload>(token: string): VerifiedToken<T> | null {
    try {
      return this.jwt.decode(token);
    } catch (error) {
      this.logger.error('Token decoding failed', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
