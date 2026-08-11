import { Controller, Get } from "@nestjs/common";

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
}