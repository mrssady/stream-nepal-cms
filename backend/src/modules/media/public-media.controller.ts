import { Controller, Get } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { MediaService } from './media.service';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';

@Controller('public/media')
export class PublicMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  findAll(@CurrentOrganization() organization: Organization) {
    return this.mediaService.findPublic(organization);
  }
}
