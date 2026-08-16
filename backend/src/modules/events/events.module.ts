import { Module } from '@nestjs/common';

import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PublicEventsController } from './public-events.controller';

import { EventPhotosController } from './event-photos/event-photos.controller';
import { EventPhotosService } from './event-photos/event-photos.service';

import { EventVideosController } from './event-videos/event-videos.controller';
import { EventVideosService } from './event-videos/event-videos.service';

import { EventTimelineController } from './event-timeline/event-timeline.controller';
import { EventTimelineService } from './event-timeline/event-timeline.service';

import { EventSponsorsController } from './event-sponsors/event-sponsors.controller';
import { EventSponsorsService } from './event-sponsors/event-sponsors.service';

@Module({
  controllers: [
    EventsController,
    PublicEventsController,
    EventPhotosController,
    EventVideosController,
    EventTimelineController,
    EventSponsorsController,
  ],
  providers: [
    EventsService,
    EventPhotosService,
    EventVideosService,
    EventTimelineService,
    EventSponsorsService,
  ],
})
export class EventsModule {}
