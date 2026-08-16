import { Controller, Get } from '@nestjs/common';

import { SponsorsService } from './sponsors.service';

@Controller('public/sponsors')
export class PublicSponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Get()
  findAll() {
    return this.sponsorsService.findPublic();
  }
}
