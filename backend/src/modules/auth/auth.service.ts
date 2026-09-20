import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserTokenType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { generateToken, hashToken } from '../../common/utils/token.util';
import {
  resetPasswordEmailHtml,
  resetPasswordEmailText,
} from '../mail/mail-templates';

import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

const PASSWORD_RESET_TTL_HOURS = 1;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  }

  async getProfile(userId: string) {
    try {
      return await this.usersService.findById(userId);
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const tokenHash = hashToken(verifyEmailDto.token);

    const token = await this.prisma.userToken.findFirst({
      where: {
        tokenHash,
        type: UserTokenType.EMAIL_VERIFICATION,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!token) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.userToken.update({
        where: {
          id: token.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: {
          id: token.userId,
        },
        data: {
          emailVerifiedAt: new Date(),
        },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  async resendVerification(resendVerificationDto: ResendVerificationDto) {
    const user = await this.usersService.findByEmail(
      resendVerificationDto.email,
    );

    if (!user) {
      return { message: 'If the email exists, a verification link was sent' };
    }

    if (user.emailVerifiedAt) {
      return { message: 'Email is already verified' };
    }

    await this.usersService.sendVerificationEmail(
      user.id,
      user.name,
      user.email,
    );

    return { message: 'If the email exists, a verification link was sent' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      return { message: 'If the email exists, a reset link was sent' };
    }

    const token = generateToken();
    const tokenHash = hashToken(token);

    await this.prisma.userToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: UserTokenType.PASSWORD_RESET,
        expiresAt: new Date(
          Date.now() + PASSWORD_RESET_TTL_HOURS * 60 * 60 * 1000,
        ),
      },
    });

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.send({
      to: user.email,
      subject: 'Reset your Stream Nepal password',
      html: resetPasswordEmailHtml(user.name, resetLink),
      text: resetPasswordEmailText(user.name, resetLink),
    });

    return { message: 'If the email exists, a reset link was sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const tokenHash = hashToken(resetPasswordDto.token);

    const token = await this.prisma.userToken.findFirst({
      where: {
        tokenHash,
        type: UserTokenType.PASSWORD_RESET,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!token) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.userToken.update({
        where: {
          id: token.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: {
          id: token.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }
}
