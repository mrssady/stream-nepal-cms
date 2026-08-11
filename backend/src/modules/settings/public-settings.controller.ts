import {
  Controller,
  Get,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Controller('public/settings')
export class PublicSettingsController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async find() {
    const organization =
      await this.prisma.organization.findUnique({
        where: {
          slug: 'stream-nepal',
        },
      });

    if (!organization) {
      throw new NotFoundException(
        'Stream Nepal organization not found',
      );
    }

    const setting =
      await this.prisma.websiteSetting.findFirst({
        where: {
          organizationId: organization.id,
        },
      });

    if (!setting) {
      throw new NotFoundException(
        'Website settings not found',
      );
    }

    return {
      companyName: setting.companyName,
      tagline: setting.tagline,
      logo: setting.logo,
      email: setting.email,
      phone: setting.phone,
      alternatePhone: setting.alternatePhone,
      address: setting.address,
      city: setting.city,
      country: setting.country,
      website: setting.website,
      facebook: setting.facebook,
      instagram: setting.instagram,
      youtube: setting.youtube,
      discord: setting.discord,
      tiktok: setting.tiktok,
      linkedin: setting.linkedin,
      seoTitle: setting.seoTitle,
      seoDescription: setting.seoDescription,
      seoKeywords: setting.seoKeywords,
      footerText: setting.footerText,
      copyrightText: setting.copyrightText,
    };
  }
}