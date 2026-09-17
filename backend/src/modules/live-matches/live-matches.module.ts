import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { LiveMatchesController } from './live-matches.controller';
import { PublicLiveMatchesController } from './public-live-matches.controller';

import { LiveMatchesService } from './live-matches.service';
import { LiveMatchStateService } from './live-match-state.service';
import { LiveMatchScoringService } from './live-match-scoring.service';
import { LiveMatchEventsService } from './live-match-events.service';
import { LiveMatchRealtimeGateway } from './live-match-realtime.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [LiveMatchesController, PublicLiveMatchesController],
  providers: [
    LiveMatchesService,
    LiveMatchStateService,
    LiveMatchScoringService,
    LiveMatchEventsService,
    LiveMatchRealtimeGateway,
  ],
  exports: [LiveMatchesService, LiveMatchStateService, LiveMatchEventsService],
})
export class LiveMatchesModule {}
