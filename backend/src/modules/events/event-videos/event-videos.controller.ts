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

import { EventVideosService } from './event-videos.service';

import { CreateEventVideoDto } from './dto/create-event-video.dto';
import { UpdateEventVideoDto } from './dto/update-event-video.dto';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../../common/decorators/current-organization.decorator';
import { Role } from '../../../common/enums/role.enum';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';

@Controller('events/:eventId/videos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventVideosController {
  constructor(
    private readonly service: EventVideosService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async create(
    @CurrentOrganization() organization: Organization,
    @Param('eventId') eventId: string,
    @Body() dto: CreateEventVideoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const video = await this.service.create(organization, eventId, dto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'event-video',
      video.id,
      `Added video "${video.title ?? 'Untitled'}" to an event`,
    );

    return video;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findAll(
    @CurrentOrganization() organization: Organization,
    @Param('eventId') eventId: string,
  ) {
    return this.service.findAll(organization, eventId);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findOne(
    @CurrentOrganization() organization: Organization,
    @Param('eventId') eventId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(organization, eventId, id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async update(
    @CurrentOrganization() organization: Organization,
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEventVideoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const video = await this.service.update(organization, eventId, id, dto);

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'event-video',
      video.id,
      `Updated video "${video.title ?? 'Untitled'}"`,
    );

    return video;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @CurrentOrganization() organization: Organization,
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const video = await this.service.remove(organization, eventId, id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'event-video',
      video.id,
      `Removed video "${video.title ?? 'Untitled'}" from an event`,
    );

    return video;
  }
}
