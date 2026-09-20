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
import type { Organization } from '@prisma/client';

import { TeamService } from './team.service';

import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('team')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(
    @CurrentOrganization() organization: Organization,
    @Body() createTeamDto: CreateTeamDto,
  ) {
    return this.teamService.create(organization, createTeamDto);
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  findAll(@CurrentOrganization() organization: Organization) {
    return this.teamService.findAll(organization);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  findOne(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
  ) {
    return this.teamService.findOne(organization, id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  update(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamService.update(organization, id, updateTeamDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
  ) {
    return this.teamService.remove(organization, id);
  }
}
