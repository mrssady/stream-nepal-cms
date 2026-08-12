import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { CreateEventSeriesDto } from "./dto/create-event-series.dto";
import { UpdateEventSeriesDto } from "./dto/update-event-series.dto";
import { EventSeriesService } from "./event-series.service";

@Controller("event-series")
export class EventSeriesController {
  constructor(
    private readonly eventSeriesService: EventSeriesService,
  ) {}

  @Post()
  create(
    @Body()
    createEventSeriesDto: CreateEventSeriesDto,
  ) {
    return this.eventSeriesService.create(
      createEventSeriesDto,
    );
  }

  @Get()
  findAll() {
    return this.eventSeriesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.eventSeriesService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body()
    updateEventSeriesDto: UpdateEventSeriesDto,
  ) {
    return this.eventSeriesService.update(
      id,
      updateEventSeriesDto,
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.eventSeriesService.remove(id);
  }
}