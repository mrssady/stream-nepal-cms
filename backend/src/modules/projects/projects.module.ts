import { Module } from "@nestjs/common";

import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { PublicProjectsController } from "./public-projects.controller";

@Module({
  controllers: [ProjectsController,PublicProjectsController,],
  providers: [ProjectsService],
})
export class ProjectsModule {}