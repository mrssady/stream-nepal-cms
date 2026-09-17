import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { LiveMatchesController } from './live-matches.controller';
import { PublicLiveMatchesController } from './public-live-matches.controller';
import { OcrProfilesController } from './ocr-profiles.controller';

import { LiveMatchesService } from './live-matches.service';
import { LiveMatchStateService } from './live-match-state.service';
import { LiveMatchScoringService } from './live-match-scoring.service';
import { LiveMatchEventsService } from './live-match-events.service';
import { LiveMatchOcrService } from './live-match-ocr.service';
import { OcrProfilesService } from './ocr-profiles.service';
import { LiveMatchRealtimeGateway } from './live-match-realtime.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [
    LiveMatchesController,
    PublicLiveMatchesController,
    OcrProfilesController,
  ],
  providers: [
    LiveMatchesService,
    LiveMatchStateService,
    LiveMatchScoringService,
    LiveMatchEventsService,
    LiveMatchOcrService,
    OcrProfilesService,
    LiveMatchRealtimeGateway,
  ],
  exports: [
    LiveMatchesService,
    LiveMatchStateService,
    LiveMatchEventsService,
    LiveMatchOcrService,
  ],
})
export class LiveMatchesModule {}
