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
import { ActivityAction, type Organization } from '@prisma/client';

import { ServicesService } from './services.service';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async create(
    @CurrentOrganization() organization: Organization,
    @Body()
    createServiceDto: CreateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const service = await this.servicesService.create(
      organization,
      createServiceDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'service',
      service.id,
      `Created service "${service.title}"`,
    );

    return service;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findAll(@CurrentOrganization() organization: Organization) {
    return this.servicesService.findAll(organization);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findOne(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
  ) {
    return this.servicesService.findOne(organization, id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async update(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
    @Body()
    updateServiceDto: UpdateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const service = await this.servicesService.update(
      organization,
      id,
      updateServiceDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'service',
      service.id,
      `Updated service "${service.title}"`,
    );

    return service;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.servicesService.findOne(organization, id);
    const service = await this.servicesService.remove(organization, id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'service',
      service.id,
      `Deleted service "${existing.title}"`,
    );

    return service;
  }
}
