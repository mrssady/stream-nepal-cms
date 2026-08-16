import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ActivityAction } from '@prisma/client';

import { TournamentsService } from './tournaments.service';

import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('tournaments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TournamentsController {
  constructor(
    private readonly tournamentsService: TournamentsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(
    @Body() createTournamentDto: CreateTournamentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const tournament = await this.tournamentsService.create(
      createTournamentDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'tournament',
      tournament.id,
      `Created tournament "${tournament.name}"`,
    );

    return tournament;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const tournament = await this.tournamentsService.update(
      id,
      updateTournamentDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'tournament',
      tournament.id,
      `Updated tournament "${tournament.name}"`,
    );

    return tournament;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.tournamentsService.findOne(id);
    const tournament = await this.tournamentsService.remove(id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'tournament',
      tournament.id,
      `Deleted tournament "${existing.name}"`,
    );

    return tournament;
  }
}
