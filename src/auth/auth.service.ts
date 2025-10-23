import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma, Role } from '@/generated/prisma';
import { IAuthPayload } from '@/types';
import { MailerService } from '@nestjs-modules/mailer';
import { emailVerificationTemplate } from '@/utils/templates/email-verification.template';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { TokenService } from '@/tokens/token.service';
import { RefreshTokenService } from '@/tokens/refresh-token.service';
import { LoginInput } from '@/types/graphql';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async signup(input: Prisma.UserCreateArgs): Promise<IAuthPayload> {
    let roles: Role[] = [];

    if (Array.isArray(input.data.roles)) {
      roles = input.data.roles;
    } else if (input.data.roles && 'set' in input.data.roles) {
      roles = input.data.roles.set;
    }

    if (roles.includes(Role.ADMIN)) {
      throw new BadRequestException('You cannot assign yourself an ADMIN role');
    }

    const existingUser = await this.usersService.findOne({
      where: { email: input.data.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const password = await argon2.hash(input.data.password);
    const APP_URL = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    const APP_NAME = this.configService.get<string>('APP_NAME', 'OneBoard');
    const SUPPORT_EMAIL = this.configService.get<string>(
      'SUPPORT_EMAIL',
      'support@example.com',
    );
    const LOGO_URL = this.configService.get<string>(
      'LOGO_URL',
      'https://dummyimage.com/110x40/2563eb/fff&text=OneBoard',
    );

    const user = await this.usersService.create({
      ...input,
      data: {
        ...input.data,
        password,
      },
    });

    const emailToken = this.tokenService.generateVerificationToken(user);
    const verificationUrl = `${APP_URL}/auth/verify-email?verificationToken=${emailToken}`;

    const html = emailVerificationTemplate(
      user.email.split('@')[0],
      verificationUrl,
      24,
      APP_NAME,
      SUPPORT_EMAIL,
      LOGO_URL,
    );

    this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Verify your email',
        html,
      })
      .catch((err) =>
        this.logger.error(`Failed to send verification email: ${err}`),
      );

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    return { accessToken, refreshToken, user };
  }

  async login(input: LoginInput): Promise<IAuthPayload> {
    const { password, ...rest } = input;

    const identifiers: {
      key: keyof typeof rest;
      dbField: keyof Prisma.UserWhereUniqueInput;
    }[] = [
      { key: 'email', dbField: 'email' },
      { key: 'username', dbField: 'username' },
      { key: 'phoneNumber', dbField: 'phone' },
    ];

    const where =
      identifiers
        .map(({ key, dbField }) =>
          rest[key]
            ? ({
                [dbField]: rest[key],
              } as unknown as Prisma.UserWhereUniqueInput)
            : null,
        )
        .find(Boolean) ?? null;

    if (!where) {
      throw new BadRequestException(
        'Provide at least one of email, username, or phone number',
      );
    }

    const user = await this.usersService.findOne({ where });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) throw new UnauthorizedException('Incorrect password');

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
    );

    return { accessToken, refreshToken, user };
  }

  /**
   * Refreshes access + refresh tokens using a valid refresh token.
   */
  async refreshToken(refreshToken: string): Promise<IAuthPayload> {
    const { valid, userId } =
      await this.refreshTokenService.isValid(refreshToken);
    if (!valid || !userId)
      throw new UnauthorizedException('Invalid or expired refresh token');

    const user = await this.usersService.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const newRefreshToken =
      await this.refreshTokenService.rotateToken(refreshToken);
    const newAccessToken = this.tokenService.generateAccessToken(user);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
  }

  async verifyEmail(token: string): Promise<boolean> {
    const { sub: userId } = this.tokenService.verify(token);

    await this.usersService.update({
      where: { id: userId },
      data: { emailIsVerified: true },
    });

    return true;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeToken(refreshToken);
  }
}
