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

import { CreateEventSeriesDto } from './dto/create-event-series.dto';
import { UpdateEventSeriesDto } from './dto/update-event-series.dto';
import { EventSeriesService } from './event-series.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('event-series')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventSeriesController {
  constructor(
    private readonly eventSeriesService: EventSeriesService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async create(
    @CurrentOrganization() organization: Organization,
    @Body()
    createEventSeriesDto: CreateEventSeriesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const series = await this.eventSeriesService.create(
      organization,
      createEventSeriesDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'event-series',
      series.id,
      `Created event series "${series.title}"`,
    );

    return series;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findAll(@CurrentOrganization() organization: Organization) {
    return this.eventSeriesService.findAll(organization);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findOne(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
  ) {
    return this.eventSeriesService.findOne(organization, id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async update(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
    @Body()
    updateEventSeriesDto: UpdateEventSeriesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const series = await this.eventSeriesService.update(
      organization,
      id,
      updateEventSeriesDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'event-series',
      series.id,
      `Updated event series "${series.title}"`,
    );

    return series;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.eventSeriesService.findOne(organization, id);
    const series = await this.eventSeriesService.remove(organization, id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'event-series',
      series.id,
      `Deleted event series "${existing.title}"`,
    );

    return series;
  }
}
