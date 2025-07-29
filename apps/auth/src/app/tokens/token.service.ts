import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@boundless/types/prisma';

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  generateAccessToken(user: Pick<User, 'id' | 'email' | 'roles'>): string {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
  }

  verify(token: string): any {
    return this.jwt.verify(token);
  }

  decode(token: string): any {
    return this.jwt.decode(token);
  }
}
