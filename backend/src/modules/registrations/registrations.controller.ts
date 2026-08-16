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

import { RegistrationsService } from './registrations.service';

import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(
    @Body()
    createRegistrationDto: CreateRegistrationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const registration = await this.registrationsService.create(
      createRegistrationDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'registration',
      registration.id,
      `Registered team "${registration.teamName}"`,
    );

    return registration;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  findAll() {
    return this.registrationsService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body()
    updateRegistrationDto: UpdateRegistrationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const registration = await this.registrationsService.update(
      id,
      updateRegistrationDto,
    );

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'registration',
      registration.id,
      `Updated registration "${registration.teamName}"`,
    );

    return registration;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.registrationsService.findOne(id);
    const registration = await this.registrationsService.remove(id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'registration',
      registration.id,
      `Removed registration "${existing.teamName}"`,
    );

    return registration;
  }
}
