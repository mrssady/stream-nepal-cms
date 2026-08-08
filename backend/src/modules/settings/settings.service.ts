import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

import { CreateSettingDto } from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrganization() {
    const organization =
      await this.prisma.organization.findUnique({
        where: {
          slug: "stream-nepal",
        },
      });

    if (!organization) {
      throw new NotFoundException(
        "Stream Nepal organization not found",
      );
    }

    return organization;
  }

  async create(createSettingDto: CreateSettingDto) {
    const organization =
      await this.getOrganization();

    const existingSetting =
      await this.prisma.websiteSetting.findFirst({
        where: {
          organizationId: organization.id,
        },
      });

    if (existingSetting) {
      throw new ConflictException(
        "Website settings already exist",
      );
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

  async find() {
    const organization =
      await this.getOrganization();

    const setting =
      await this.prisma.websiteSetting.findFirst({
        where: {
          organizationId: organization.id,
        },
      });

    if (!setting) {
      throw new NotFoundException(
        "Website settings not found",
      );
    }

    return setting;
  }

  async update(updateSettingDto: UpdateSettingDto) {
    const organization =
      await this.getOrganization();

    const setting =
      await this.prisma.websiteSetting.findFirst({
        where: {
          organizationId: organization.id,
        },
      });

    if (!setting) {
      throw new NotFoundException(
        "Website settings not found",
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