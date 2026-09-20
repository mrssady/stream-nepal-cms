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

import { EventsService } from './events.service';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async create(
    @CurrentOrganization() organization: Organization,
    @Body()
    createEventDto: CreateEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const event = await this.eventsService.create(organization, createEventDto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'event',
      event.id,
      `Created event "${event.title}"`,
    );

    return event;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findAll(@CurrentOrganization() organization: Organization) {
    return this.eventsService.findAll(organization);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findOne(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
  ) {
    return this.eventsService.findOne(organization, id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async update(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
    @Body()
    updateEventDto: UpdateEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const event = await this.eventsService.update(
      organization,
      id,
      updateEventDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'event',
      event.id,
      `Updated event "${event.title}"`,
    );

    return event;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const event = await this.eventsService.remove(organization, id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'event',
      event.id,
      `Deleted event "${event.title}"`,
    );

    return event;
  }
}
