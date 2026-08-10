import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { ProjectsService } from "./projects.service";

import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";

@Controller("projects")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
  )
  create(
    @Body()
    createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(
      createProjectDto,
    );
  }

  @Get()
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
    Role.STAFF,
  )
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(":id")
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
    Role.STAFF,
  )
  findOne(@Param("id") id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(":id")
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
  )
  update(
    @Param("id") id: string,
    @Body()
    updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(
      id,
      updateProjectDto,
    );
  }

  @Delete(":id")
  @Roles(
    Role.OWNER,
    Role.ADMIN,
  )
  remove(@Param("id") id: string) {
    return this.projectsService.remove(id);
  }
}