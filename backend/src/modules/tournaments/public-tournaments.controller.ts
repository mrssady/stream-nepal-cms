import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { TournamentsService } from './tournaments.service';
import { CreatePublicRegistrationDto } from './dto/create-public-registration.dto';

@Controller('public/tournaments')
export class PublicTournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  findAll() {
    return this.tournamentsService.findPublic();
  }

  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.tournamentsService.findPublicBySlug(slug);
  }

  @Post(':slug/register')
  register(
    @Param('slug') slug: string,
    @Body() createPublicRegistrationDto: CreatePublicRegistrationDto,
  ) {
    return this.tournamentsService.registerPublic(
      slug,
      createPublicRegistrationDto,
    );
  }
}