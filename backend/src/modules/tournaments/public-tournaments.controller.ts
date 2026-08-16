import { Controller, Get } from '@nestjs/common';

import { TournamentsService } from './tournaments.service';

@Controller('public/tournaments')
export class PublicTournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  findAll() {
    return this.tournamentsService.findPublic();
  }
}
