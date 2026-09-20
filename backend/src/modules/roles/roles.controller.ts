import { Controller, Get, UseGuards } from '@nestjs/common';

import { RolesService } from './roles.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  getOverview() {
    return this.rolesService.getOverview();
  }
}
