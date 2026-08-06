import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSettingDto: CreateSettingDto) {
    const existingSetting =
      await this.prisma.websiteSetting.findFirst();

    if (existingSetting) {
      throw new ConflictException(
        'Website settings already exist',
      );
    }

    return this.prisma.websiteSetting.create({
      data: createSettingDto,
    });
  }

  async find() {
    const setting =
      await this.prisma.websiteSetting.findFirst();

    if (!setting) {
      throw new NotFoundException(
        'Website settings not found',
      );
    }

    return setting;
  }

  async update(updateSettingDto: UpdateSettingDto) {
    const setting =
      await this.prisma.websiteSetting.findFirst();

    if (!setting) {
      throw new NotFoundException(
        'Website settings not found',
      );
    }

    return this.prisma.websiteSetting.update({
      where: {
        id: setting.id,
      },
      data: updateSettingDto,
    });
  }
}