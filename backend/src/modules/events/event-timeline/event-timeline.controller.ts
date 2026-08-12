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

import { EventTimelineService } from "./event-timeline.service";

import { CreateEventTimelineDto } from "./dto/create-event-timeline.dto";
import { UpdateEventTimelineDto } from "./dto/update-event-timeline.dto";

import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";

@Controller("events/:eventId/timeline")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventTimelineController {
  constructor(
    private readonly service: EventTimelineService,
  ) {}

  @Post()
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
  )
  create(
    @Param("eventId") eventId: string,
    @Body() dto: CreateEventTimelineDto,
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
    @Body() dto: UpdateEventTimelineDto,
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