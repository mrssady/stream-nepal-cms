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
import { ActivityAction } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

import { LiveMatchesService } from './live-matches.service';
import { LiveMatchEventsService } from './live-match-events.service';
import { LiveMatchStateService } from './live-match-state.service';
import { LiveMatchOcrService } from './live-match-ocr.service';

import { CreateLiveMatchDto } from './dto/create-live-match.dto';
import { UpdateLiveMatchDto } from './dto/update-live-match.dto';
import { AppendMatchEventDto } from './dto/append-match-event.dto';
import { UndoLiveMatchDto } from './dto/undo-live-match.dto';
import { ReasonDto } from './dto/reason.dto';
import { StartZoneOcrDto } from './dto/start-zone-ocr.dto';

@Controller('live-matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LiveMatchesController {
  constructor(
    private readonly liveMatchesService: LiveMatchesService,
    private readonly eventsService: LiveMatchEventsService,
    private readonly stateService: LiveMatchStateService,
    private readonly ocrService: LiveMatchOcrService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(
    @Body() createLiveMatchDto: CreateLiveMatchDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const match = await this.liveMatchesService.create(createLiveMatchDto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'live-match',
      match.id,
      `Created live match "${match.name}"`,
    );

    return match;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  findAll(@Query('tournamentId') tournamentId?: string) {
    return this.liveMatchesService.findAll(tournamentId);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async findOne(@Param('id') id: string) {
    const match = await this.liveMatchesService.findOne(id);
    const state = await this.stateService.getState(id);

    return { match, state };
  }

  @Get(':id/state')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  getState(@Param('id') id: string) {
    return this.stateService.getState(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateLiveMatchDto: UpdateLiveMatchDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const match = await this.liveMatchesService.update(id, updateLiveMatchDto);

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'live-match',
      match.id,
      `Updated live match "${match.name}"`,
    );

    return match;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.liveMatchesService.findOne(id);
    const match = await this.liveMatchesService.remove(id);
    this.stateService.invalidate(id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'live-match',
      match.id,
      `Deleted live match "${existing.name}"`,
    );

    return match;
  }

  @Post(':id/events')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  appendEvent(
    @Param('id') id: string,
    @Body() appendMatchEventDto: AppendMatchEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.eventsService.append(id, appendMatchEventDto, user);
  }

  @Post(':id/ready')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  ready(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.eventsService.ready(id, user);
  }

  @Post(':id/undo')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  undo(
    @Param('id') id: string,
    @Body() undoLiveMatchDto: UndoLiveMatchDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.eventsService.undo(id, undoLiveMatchDto, user);
  }

  @Post(':id/lock')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  lock(
    @Param('id') id: string,
    @Body() reasonDto: ReasonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.eventsService.lock(id, reasonDto.reason, user);
  }

  @Post(':id/reopen')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  reopen(
    @Param('id') id: string,
    @Body() reasonDto: ReasonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.eventsService.reopen(id, reasonDto.reason, user);
  }

  @Post(':id/ocr/start')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  startOcr(@Param('id') id: string, @Body() dto: StartZoneOcrDto) {
    return this.ocrService.start(id, dto);
  }

  @Post(':id/ocr/stop')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  stopOcr(@Param('id') id: string) {
    return this.ocrService.stop(id) ?? this.ocrService.status(id);
  }

  @Get(':id/ocr/status')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  ocrStatus(@Param('id') id: string) {
    return this.ocrService.status(id);
  }
}
