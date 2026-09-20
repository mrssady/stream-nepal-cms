import { Controller, Get, NotFoundException } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@Controller('public/settings')
export class PublicSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async find(@CurrentOrganization() organization: Organization) {
    const setting = await this.prisma.websiteSetting.findFirst({
      where: {
        organizationId: organization.id,
      },
    });

    if (!setting) {
      throw new NotFoundException('Website settings not found');
    }

    return {
      companyName: setting.companyName,
      tagline: setting.tagline,
      logo: setting.logo,
      favicon: setting.favicon,
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
