import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organization: Organization, createSettingDto: CreateSettingDto) {
    const existingSetting = await this.prisma.websiteSetting.findFirst({
      where: {
        organizationId: organization.id,
      },
    });

    if (existingSetting) {
      throw new ConflictException('Website settings already exist');
    }

    return this.prisma.websiteSetting.create({
      data: {
        ...createSettingDto,
        organization: {
          connect: {
            id: organization.id,
          },
        },
      },
    });
  }

  async find(organization: Organization) {
    const setting = await this.prisma.websiteSetting.findFirst({
      where: {
        organizationId: organization.id,
      },
    });

    if (!setting) {
      throw new NotFoundException('Website settings not found');
    }

    return setting;
  }

  async update(organization: Organization, updateSettingDto: UpdateSettingDto) {
    const setting = await this.prisma.websiteSetting.findFirst({
      where: {
        organizationId: organization.id,
      },
    });

    if (!setting) {
      throw new NotFoundException('Website settings not found');
    }

    return this.prisma.websiteSetting.update({
      where: {
        id: setting.id,
      },
      data: updateSettingDto,
    });
  }
}
