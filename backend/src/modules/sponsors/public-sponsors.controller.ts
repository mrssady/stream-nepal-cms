import { Controller, Get } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { SponsorsService } from './sponsors.service';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@Controller('public/sponsors')
export class PublicSponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Get()
  findAll(@CurrentOrganization() organization: Organization) {
    return this.sponsorsService.findPublic(organization);
  }
}
