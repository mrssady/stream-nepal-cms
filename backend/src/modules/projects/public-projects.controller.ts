import { Controller, Get, Param } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { ProjectsService } from './projects.service';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@Controller('public/projects')
export class PublicProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentOrganization() organization: Organization) {
    return this.projectsService.findPublic(organization);
  }

  @Get(':slug')
  findOne(
    @CurrentOrganization() organization: Organization,
    @Param('slug') slug: string,
  ) {
    return this.projectsService.findPublicOne(organization, slug);
  }
}
