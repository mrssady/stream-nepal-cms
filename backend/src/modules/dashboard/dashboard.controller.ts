import { Controller, Get, UseGuards } from '@nestjs/common';

import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('stats')
  @Roles(Role.OWNER, Role.ADMIN)
  getStats() {
    return this.dashboardService.getStats();
  }
  @Get('activity')
@Roles(Role.OWNER, Role.ADMIN)
getRecentActivity() {
  return this.dashboardService.getRecentActivity();
}
}