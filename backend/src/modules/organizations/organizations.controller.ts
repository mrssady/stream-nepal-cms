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

import { OrganizationsService } from './organizations.service';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(
    @Body()
    createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const organization = await this.organizationsService.create(
      createOrganizationDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'organization',
      organization.id,
      `Created organization "${organization.name}"`,
    );

    return organization;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body()
    updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const organization = await this.organizationsService.update(
      id,
      updateOrganizationDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'organization',
      organization.id,
      `Updated organization "${organization.name}"`,
    );

    return organization;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.organizationsService.findOne(id);
    const organization = await this.organizationsService.remove(id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'organization',
      organization.id,
      `Removed organization "${existing.name}"`,
    );

    return organization;
  }
}
