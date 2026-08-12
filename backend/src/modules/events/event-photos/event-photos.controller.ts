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

import { EventPhotosService } from "./event-photos.service";

import { CreateEventPhotoDto } from "./create-event-photo.dto";
import { UpdateEventPhotoDto } from "./dto/update-event-photo.dto";

import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";

@Controller("events/:eventId/photos")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventPhotosController {
  constructor(
    private readonly service: EventPhotosService,
  ) {}

  @Post()
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
  )
  create(
    @Param("eventId") eventId: string,
    @Body() dto: CreateEventPhotoDto,
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
    @Body() dto: UpdateEventPhotoDto,
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