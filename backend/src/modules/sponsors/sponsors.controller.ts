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

import { SponsorsService } from './sponsors.service';

import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('sponsors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SponsorsController {
  constructor(
    private readonly sponsorsService: SponsorsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async create(
    @Body()
    createSponsorDto: CreateSponsorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const sponsor = await this.sponsorsService.create(createSponsorDto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'sponsor',
      sponsor.id,
      `Created sponsor "${sponsor.name}"`,
    );

    return sponsor;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findAll() {
    return this.sponsorsService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findOne(@Param('id') id: string) {
    return this.sponsorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body()
    updateSponsorDto: UpdateSponsorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const sponsor = await this.sponsorsService.update(id, updateSponsorDto);

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'sponsor',
      sponsor.id,
      `Updated sponsor "${sponsor.name}"`,
    );

    return sponsor;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.sponsorsService.findOne(id);
    const sponsor = await this.sponsorsService.remove(id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'sponsor',
      sponsor.id,
      `Deleted sponsor "${existing.name}"`,
    );

    return sponsor;
  }
}
