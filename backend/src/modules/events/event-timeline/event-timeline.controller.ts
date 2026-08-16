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

import { EventTimelineService } from './event-timeline.service';

import { CreateEventTimelineDto } from './dto/create-event-timeline.dto';
import { UpdateEventTimelineDto } from './dto/update-event-timeline.dto';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';

@Controller('events/:eventId/timeline')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventTimelineController {
  constructor(
    private readonly service: EventTimelineService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateEventTimelineDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const entry = await this.service.create(eventId, dto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'event-timeline',
      entry.id,
      `Added timeline entry "${entry.title ?? 'Untitled'}" to an event`,
    );

    return entry;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findAll(@Param('eventId') eventId: string) {
    return this.service.findAll(eventId);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findOne(@Param('eventId') eventId: string, @Param('id') id: string) {
    return this.service.findOne(eventId, id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async update(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEventTimelineDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const entry = await this.service.update(eventId, id, dto);

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'event-timeline',
      entry.id,
      `Updated timeline entry "${entry.title ?? 'Untitled'}"`,
    );

    return entry;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const entry = await this.service.remove(eventId, id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'event-timeline',
      entry.id,
      `Removed timeline entry "${entry.title ?? 'Untitled'}" from an event`,
    );

    return entry;
  }
}
