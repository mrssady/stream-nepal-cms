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

import { EventSponsorsService } from './event-sponsors.service';

import { CreateEventSponsorDto } from './create-event-sponsor.dto';
import { UpdateEventSponsorDto } from './update-event-sponsor.dto';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';

@Controller('events/:eventId/sponsors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventSponsorsController {
  constructor(
    private readonly service: EventSponsorsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateEventSponsorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const link = await this.service.create(eventId, dto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'event-sponsor',
      link.id,
      `Linked sponsor "${link.sponsor.name}" to an event`,
    );

    return link;
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
    @Body() dto: UpdateEventSponsorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const link = await this.service.update(eventId, id, dto);

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'event-sponsor',
      link.id,
      `Updated event sponsor link "${link.sponsor?.name ?? 'Untitled'}"`,
    );

    return link;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.service.findOne(eventId, id);
    const link = await this.service.remove(eventId, id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'event-sponsor',
      link.id,
      `Unlinked sponsor "${existing.sponsor?.name ?? 'Untitled'}" from an event`,
    );

    return link;
  }
}
