import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";

import { EventSeriesController } from "./event-series.controller";
import { EventSeriesService } from "./event-series.service";

@Module({
  imports: [PrismaModule],
  controllers: [EventSeriesController],
  providers: [EventSeriesService],
  exports: [EventSeriesService],
})
export class EventSeriesModule {}