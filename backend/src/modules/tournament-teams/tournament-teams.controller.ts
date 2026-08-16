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

import { TournamentTeamsService } from './tournament-teams.service';

import { CreateTournamentTeamDto } from './dto/create-tournament-team.dto';
import { UpdateTournamentTeamDto } from './dto/update-tournament-team.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('tournament-teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TournamentTeamsController {
  constructor(
    private readonly tournamentTeamsService: TournamentTeamsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(
    @Body()
    createTournamentTeamDto: CreateTournamentTeamDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const team = await this.tournamentTeamsService.create(
      createTournamentTeamDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'team',
      team.id,
      `Created team "${team.teamName}"`,
    );

    return team;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  findAll() {
    return this.tournamentTeamsService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.tournamentTeamsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body()
    updateTournamentTeamDto: UpdateTournamentTeamDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const team = await this.tournamentTeamsService.update(
      id,
      updateTournamentTeamDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'team',
      team.id,
      `Updated team "${team.teamName}"`,
    );

    return team;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.tournamentTeamsService.findOne(id);
    const team = await this.tournamentTeamsService.remove(id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'team',
      team.id,
      `Deleted team "${existing.teamName}"`,
    );

    return team;
  }
}
