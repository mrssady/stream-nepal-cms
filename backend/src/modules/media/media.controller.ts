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

import { MediaService } from "./media.service";

import { CreateMediaDto } from "./dto/create-media.dto";
import { UpdateMediaDto } from "./dto/update-media.dto";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";

@Controller("media")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(
    @Body() createMediaDto: CreateMediaDto,
  ) {
    return this.mediaService.create(
      createMediaDto,
    );
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(":id")
  @Roles(Role.OWNER, Role.ADMIN)
  findOne(@Param("id") id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch(":id")
  @Roles(Role.OWNER, Role.ADMIN)
  update(
    @Param("id") id: string,
    @Body() updateMediaDto: UpdateMediaDto,
  ) {
    return this.mediaService.update(
      id,
      updateMediaDto,
    );
  }

  @Delete(":id")
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.mediaService.remove(id);
  }
}