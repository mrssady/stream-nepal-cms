import { Controller, Get, Param } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { EventsService } from './events.service';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@Controller('public/events')
export class PublicEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@CurrentOrganization() organization: Organization) {
    return this.eventsService.findPublic(organization);
  }

  @Get(':slug')
  findOne(
    @CurrentOrganization() organization: Organization,
    @Param('slug') slug: string,
  ) {
    return this.eventsService.findPublicBySlug(organization, slug);
  }
}
