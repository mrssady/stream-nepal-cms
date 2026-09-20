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

import { EventPhotosService } from './event-photos.service';

import { CreateEventPhotoDto } from './create-event-photo.dto';
import { UpdateEventPhotoDto } from './dto/update-event-photo.dto';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../../common/decorators/current-organization.decorator';
import { Role } from '../../../common/enums/role.enum';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';

@Controller('events/:eventId/photos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventPhotosController {
  constructor(
    private readonly service: EventPhotosService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async create(
    @CurrentOrganization() organization: Organization,
    @Param('eventId') eventId: string,
    @Body() dto: CreateEventPhotoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const photo = await this.service.create(organization, eventId, dto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'event-photo',
      photo.id,
      `Added photo "${photo.title ?? 'Untitled'}" to an event`,
    );

    return photo;
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
    @Body() dto: UpdateEventPhotoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const photo = await this.service.update(organization, eventId, id, dto);

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'event-photo',
      photo.id,
      `Updated photo "${photo.title ?? 'Untitled'}"`,
    );

    return photo;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @CurrentOrganization() organization: Organization,
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const photo = await this.service.remove(organization, eventId, id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'event-photo',
      photo.id,
      `Removed photo "${photo.title ?? 'Untitled'}" from an event`,
    );

    return photo;
  }
}
