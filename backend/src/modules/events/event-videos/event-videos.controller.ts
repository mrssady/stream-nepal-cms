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

import { EventVideosService } from "./event-videos.service";

import { CreateEventVideoDto } from "./dto/create-event-video.dto";
import { UpdateEventVideoDto } from "./dto/update-event-video.dto";

import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";

@Controller("events/:eventId/videos")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventVideosController {
  constructor(
    private readonly service: EventVideosService,
  ) {}

  @Post()
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
  )
  create(
    @Param("eventId") eventId: string,
    @Body() dto: CreateEventVideoDto,
  ) {
    return this.service.create(
      eventId,
      dto,
    );
  }

  @Get()
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
    Role.STAFF,
  )
  findAll(
    @Param("eventId") eventId: string,
  ) {
    return this.service.findAll(
      eventId,
    );
  }

  @Get(":id")
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
    Role.STAFF,
  )
  findOne(
    @Param("eventId") eventId: string,
    @Param("id") id: string,
  ) {
    return this.service.findOne(
      eventId,
      id,
    );
  }

  @Patch(":id")
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
  )
  update(
    @Param("eventId") eventId: string,
    @Param("id") id: string,
    @Body() dto: UpdateEventVideoDto,
  ) {
    return this.service.update(
      eventId,
      id,
      dto,
    );
  }

  @Delete(":id")
  @Roles(
    Role.OWNER,
    Role.ADMIN,
  )
  remove(
    @Param("eventId") eventId: string,
    @Param("id") id: string,
  ) {
    return this.service.remove(
      eventId,
      id,
    );
  }
}