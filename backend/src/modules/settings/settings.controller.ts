import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { SettingsService } from './settings.service';

import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
  ) {}

  @Post()
  @Roles(Role.OWNER)
  create(
    @Body()
    createSettingDto: CreateSettingDto,
  ) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  find() {
    return this.settingsService.find();
  }

  @Patch()
  @Roles(Role.OWNER)
  update(
    @Body()
    updateSettingDto: UpdateSettingDto,
  ) {
    return this.settingsService.update(updateSettingDto);
  }
}