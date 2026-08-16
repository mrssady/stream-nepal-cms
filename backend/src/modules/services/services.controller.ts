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

import { ServicesService } from './services.service';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
    @Body()
    createServiceDto: CreateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const service = await this.servicesService.create(createServiceDto);

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
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body()
    updateServiceDto: UpdateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const service = await this.servicesService.update(id, updateServiceDto);

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
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.servicesService.findOne(id);
    const service = await this.servicesService.remove(id);

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
