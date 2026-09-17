import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityAction, TournamentGame } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

import { OcrProfilesService } from './ocr-profiles.service';

import { CreateOcrProfileDto } from './dto/create-ocr-profile.dto';
import { UpdateOcrProfileDto } from './dto/update-ocr-profile.dto';

@Controller('ocr-profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OcrProfilesController {
  constructor(
    private readonly ocrProfilesService: OcrProfilesService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(
    @Body() createOcrProfileDto: CreateOcrProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const profile = await this.ocrProfilesService.create(createOcrProfileDto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'ocr-profile',
      profile.id,
      `Created OCR profile "${profile.name}" (${profile.game})`,
    );

    return profile;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  findAll(@Query('game') game?: TournamentGame) {
    return this.ocrProfilesService.findAll(game);
  }

  @Get(':id/rois')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  getScaledRois(
    @Param('id') id: string,
    @Query('width') width?: string,
    @Query('height') height?: string,
  ) {
    return this.ocrProfilesService.getScaledRois(id, {
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
    });
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  findOne(@Param('id') id: string) {
    return this.ocrProfilesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateOcrProfileDto: UpdateOcrProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const profile = await this.ocrProfilesService.update(
      id,
      updateOcrProfileDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'ocr-profile',
      profile.id,
      `Updated OCR profile "${profile.name}" (${profile.game})`,
    );

    return profile;
  }

  @Post(':id/default')
  @Roles(Role.OWNER, Role.ADMIN)
  async setDefault(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const profile = await this.ocrProfilesService.setDefault(id);

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'ocr-profile',
      profile.id,
      `Set OCR profile "${profile.name}" as default for ${profile.game}`,
    );

    return profile;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const profile = await this.ocrProfilesService.remove(id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'ocr-profile',
      profile.id,
      `Deleted OCR profile "${profile.name}" (${profile.game})`,
    );

    return profile;
  }
}
