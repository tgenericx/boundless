import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@boundless/types/prisma';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(private readonly jwt: JwtService) {}

  generateAccessToken(user: Pick<User, 'id' | 'roles'>): string {
    try {
      return this.jwt.sign({
        sub: user.id,
        roles: user.roles,
      });
    } catch (error) {
      this.logger.error('Failed to generate access token', error);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  verify(token: string): any {
    try {
      return this.jwt.verify(token);
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  decode(token: string): any {
    try {
      return this.jwt.decode(token);
    } catch (error) {
      this.logger.error('Token decoding failed', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
