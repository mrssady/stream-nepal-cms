import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, UserTokenType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { generateToken, hashToken } from '../../common/utils/token.util';

import { canManageRole, roleLevel, Role } from '../../common/enums/role.enum';

import { MailService } from '../mail/mail.service';
import {
  verificationEmailHtml,
  verificationEmailText,
} from '../mail/mail-templates';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto, actorId: string) {
    const actor = await this.getActor(actorId);

    if (!canManageRole(actor.role, createUserDto.role)) {
      throw new ForbiddenException(
        `You cannot create a user with the ${createUserDto.role} role`,
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.sendVerificationEmail(user.id, user.name, user.email);

    return user;
  }

  async sendVerificationEmail(userId: string, name: string, email: string) {
    const token = generateToken();
    const tokenHash = hashToken(token);

    await this.prisma.userToken.create({
      data: {
        userId,
        tokenHash,
        type: UserTokenType.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    await this.mailService.send({
      to: email,
      subject: 'Verify your Stream Nepal account',
      html: verificationEmailHtml(name, verificationLink),
      text: verificationEmailText(name, verificationLink),
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, actorId: string) {
    const actor = await this.getActor(actorId);

    const target = await this.findTarget(id);

    const isSelf = actor.id === target.id;

    if (updateUserDto.role) {
      const isChangingRole =
        roleLevel(updateUserDto.role) !== roleLevel(target.role);

      if (isChangingRole) {
        if (!canManageRole(actor.role, target.role)) {
          throw new ForbiddenException(
            `You cannot change the role of a ${target.role}`,
          );
        }

        if (!canManageRole(actor.role, updateUserDto.role)) {
          throw new ForbiddenException(
            `You cannot assign the ${updateUserDto.role} role`,
          );
        }

        if (
          roleLevel(target.role) === roleLevel(Role.OWNER) &&
          roleLevel(updateUserDto.role) !== roleLevel(Role.OWNER) &&
          (await this.isLastOwnerInScope(target))
        ) {
          throw new ForbiddenException('Cannot demote the last Owner');
        }
      }
    } else if (!isSelf) {
      if (!canManageRole(actor.role, target.role)) {
        throw new ForbiddenException(`You cannot manage a ${target.role}`);
      }
    }

    const data: Prisma.UserUpdateInput = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      role: updateUserDto.role,
    };

    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: updateUserDto.email,
        },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, actorId: string) {
    const actor = await this.getActor(actorId);

    const target = await this.findTarget(id);

    if (actor.id === target.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    if (!canManageRole(actor.role, target.role)) {
      throw new ForbiddenException(`You cannot delete a ${target.role}`);
    }

    if (
      roleLevel(target.role) === roleLevel(Role.OWNER) &&
      (await this.isLastOwnerInScope(target))
    ) {
      throw new ForbiddenException('Cannot delete the last Owner');
    }

    return this.prisma.user.delete({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  private async getActor(id: string) {
    const actor = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!actor) {
      throw new ForbiddenException('Access denied');
    }

    return actor;
  }

  private async findTarget(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async isLastOwnerInScope(target: { organizationId: string | null }) {
    const ownerCount = await this.prisma.user.count({
      where: {
        role: Role.OWNER,
        organizationId: target.organizationId,
      },
    });

    return ownerCount <= 1;
  }
}
