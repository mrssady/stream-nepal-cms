import {
  Controller,
  Get,
  Param,
} from "@nestjs/common";

import { ProjectsService } from "./projects.service";

@Controller("public/projects")
export class PublicProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  findAll() {
    return this.projectsService.findPublic();
  }

  @Get(":slug")
  findOne(
    @Param("slug") slug: string,
  ) {
    return this.projectsService.findPublicOne(
      slug,
    );
  }
}