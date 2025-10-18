import {
  Inject,
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

  constructor(@Inject('ACCESS_JWT_SERVICE') private readonly jwt: JwtService) {}

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

  generateVerificationToken(user: Pick<User, 'id'>): string {
    try {
      const payload = {
        sub: user.id,
      };
      return this.jwt.sign(payload, {
        expiresIn: '24h',
      });
    } catch (error) {
      this.logger.error('Failed to generate token', error);
      throw new InternalServerErrorException('Failed to generate token');
    }
  }

  verify<T = IAccessTokenPayload>(token: string): VerifiedToken<T> {
    try {
      return this.jwt.verify(token);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Expired token');
        } else if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token');
        }

        this.logger.error('Token verification failed', error);
        throw new UnauthorizedException('Token verification error');
      }

      this.logger.error('Unknown token verification failure', error);
      throw new UnauthorizedException('Token verification error');
    }
  }
}
