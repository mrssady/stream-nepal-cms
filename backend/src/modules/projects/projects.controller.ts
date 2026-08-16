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

import { ProjectsService } from './projects.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async create(
    @Body()
    createProjectDto: CreateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const project = await this.projectsService.create(createProjectDto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'project',
      project.id,
      `Created project "${project.title}"`,
    );

    return project;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF)
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async update(
    @Param('id') id: string,
    @Body()
    updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const project = await this.projectsService.update(id, updateProjectDto);

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'project',
      project.id,
      `Updated project "${project.title}"`,
    );

    return project;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.projectsService.findOne(id);
    const project = await this.projectsService.remove(id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'project',
      project.id,
      `Deleted project "${existing.title}"`,
    );

    return project;
  }
}
