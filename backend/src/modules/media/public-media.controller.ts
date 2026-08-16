import { Controller, Get } from '@nestjs/common';

import { MediaService } from './media.service';

@Controller('public/media')
export class PublicMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  findAll() {
    return this.mediaService.findPublic();
  }
}
