import {
  Controller,
  Get,
  Param,
} from "@nestjs/common";

import { EventsService } from "./events.service";

@Controller("public/events")
export class PublicEventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  findAll() {
    return this.eventsService.findPublic();
  }

  @Get(":slug")
  findOne(
    @Param("slug") slug: string,
  ) {
    return this.eventsService.findPublicBySlug(
      slug,
    );
  }
}