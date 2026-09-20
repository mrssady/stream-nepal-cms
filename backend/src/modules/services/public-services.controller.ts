import { Controller, Get, Param } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { ServicesService } from './services.service';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@Controller('public/services')
export class PublicServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@CurrentOrganization() organization: Organization) {
    return this.servicesService.findPublic(organization);
  }

  @Get(':slug')
  findOne(
    @CurrentOrganization() organization: Organization,
    @Param('slug') slug: string,
  ) {
    return this.servicesService.findPublicOne(organization, slug);
  }
}
