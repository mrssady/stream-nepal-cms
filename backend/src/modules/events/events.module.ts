import { Module } from "@nestjs/common";

import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { PublicEventsController } from "./public-events.controller";

@Module({
  controllers: [
    EventsController,
    PublicEventsController,
  ],
  providers: [
    EventsService,
  ],
})
export class EventsModule {}