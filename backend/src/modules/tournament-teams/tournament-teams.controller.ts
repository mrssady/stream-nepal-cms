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

import { TournamentTeamsService } from './tournament-teams.service';

import { CreateTournamentTeamDto } from './dto/create-tournament-team.dto';
import { UpdateTournamentTeamDto } from './dto/update-tournament-team.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('tournament-teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TournamentTeamsController {
  constructor(
    private readonly tournamentTeamsService: TournamentTeamsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(
    @Body()
    createTournamentTeamDto: CreateTournamentTeamDto,
  ) {
    return this.tournamentTeamsService.create(
      createTournamentTeamDto,
    );
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
  update(
    @Param('id') id: string,
    @Body()
    updateTournamentTeamDto: UpdateTournamentTeamDto,
  ) {
    return this.tournamentTeamsService.update(
      id,
      updateTournamentTeamDto,
    );
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.tournamentTeamsService.remove(id);
  }
}