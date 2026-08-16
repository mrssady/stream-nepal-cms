import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ActivityAction } from '@prisma/client';

import { SettingsService } from './settings.service';

import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER)
  async create(
    @Body()
    createSettingDto: CreateSettingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const settings = await this.settingsService.create(createSettingDto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'settings',
      settings.id,
      'Created website settings',
    );

    return settings;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  find() {
    return this.settingsService.find();
  }

  @Patch()
  @Roles(Role.OWNER)
  async update(
    @Body()
    updateSettingDto: UpdateSettingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const settings = await this.settingsService.update(updateSettingDto);

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'settings',
      settings.id,
      'Updated website settings',
    );

    return settings;
  }
}
