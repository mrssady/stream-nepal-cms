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

import { EventsService } from "./events.service";

import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";

@Controller("events")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  @Post()
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
  )
  create(
    @Body()
    createEventDto: CreateEventDto,
  ) {
    return this.eventsService.create(
      createEventDto,
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
    return this.eventsService.findAll();
  }

  @Get(":id")
  @Roles(
    Role.OWNER,
    Role.ADMIN,
    Role.MANAGER,
    Role.STAFF,
  )
  findOne(
    @Param("id") id: string,
  ) {
    return this.eventsService.findOne(
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
    @Param("id") id: string,
    @Body()
    updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(
      id,
      updateEventDto,
    );
  }

  @Delete(":id")
  @Roles(
    Role.OWNER,
    Role.ADMIN,
  )
  remove(
    @Param("id") id: string,
  ) {
    return this.eventsService.remove(
      id,
    );
  }
}