import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { MatchEventKind, MatchEventSource } from '@prisma/client';

import { StartZoneOcrDto, ZoneOcrMode } from './dto/start-zone-ocr.dto';
import { AnalyzeOcrDto } from './dto/analyze-ocr.dto';
import { LiveMatchEventsService } from './live-match-events.service';
import { LiveMatchStateService } from './live-match-state.service';
import { OcrProfilesService } from './ocr-profiles.service';
import { type OcrProfileConfig } from './ocr/ocr-config';
import { OcrAnalysisEngine } from './ocr/ocr-engine';
import { MockSpectatorProvider } from './ocr/mock-spectator-provider';
import { type AnalyzeResult, type OcrFrame } from './ocr/ocr-types';
import { MockZoneDetector, ZoneTimerDetector } from './zone-ocr.detector';

const DEFAULTS = {
  mode: ZoneOcrMode.MOCK,
  intervalMs: 1000,
  seconds: 180,
  minChangeSeconds: 5,
  confirmations: 2,
  resetJumpSeconds: 8,
  minConfidence: 0.6,
  noise: true,
};

interface ZoneOcrSession {
  matchId: string;
  mode: ZoneOcrMode;
  detector: ZoneTimerDetector;
  interval: NodeJS.Timeout | null;
  running: boolean;
  busy: boolean;
  tick: number;
  phase: number;
  zoneCount: number;
  intervalMs: number;
  minChangeSeconds: number;
  confirmations: number;
  resetJumpSeconds: number;
  minConfidence: number;
  lastCandidate: number | null;
  candidateCount: number;
  lastEmittedSeconds: number | null;
  lastReadAt: string | null;
  lastSeconds: number | null;
  lastConfidence: number | null;
  lastRaw: string | null;
  readings: number;
  emissions: number;
  startedAt: string;
  stoppedAt: string | null;
  lastError: string | null;
}

@Injectable()
export class LiveMatchOcrService implements OnModuleDestroy {
  private readonly logger = new Logger(LiveMatchOcrService.name);
  private readonly sessions = new Map<string, ZoneOcrSession>();

  constructor(
    private readonly stateService: LiveMatchStateService,
    private readonly eventsService: LiveMatchEventsService,
    private readonly profilesService: OcrProfilesService,
  ) {}

  // Dry-run analysis of the spectator OCR pipeline (spec 26-30). Never
  // writes match events: it only reports detections, manual-review signals
  // and candidate events so the operator can validate before wiring to the
  // production scorer.
  async analyze(matchId: string, dto: AnalyzeOcrDto): Promise<AnalyzeResult> {
    const match = await this.stateService.findMatch(matchId);

    const profileId =
      dto.profileId ??
      (await this.profilesService.resolveDefaultForGame(match.tournament.game));

    const profile = await this.profilesService.findOne(profileId);

    if (!profile) {
      throw new NotFoundException('OCR profile not found');
    }

    const state = await this.stateService.getState(matchId);
    const teamTags = Object.values(state.teams)
      .map((team) => team.shortName)
      .filter((tag: string | null): tag is string => Boolean(tag))
      .slice(0, 25);

    const engine = new OcrAnalysisEngine({
      confirmations: dto.confirmations ?? 3,
      dedupWindowMs: dto.dedupWindowMs ?? 1500,
    });

    const provider = new MockSpectatorProvider({
      seed: dto.seed ?? 1337,
      noiseProbability: dto.noise ? 0.1 : 0,
      confidenceBase: dto.confidenceBase ?? 0.96,
    });

    const profileConfig = profile.config as unknown as OcrProfileConfig;

    const iterations = Math.min(20, Math.max(1, dto.iterations ?? 5));
    const frame: OcrFrame = {
      width: 1920,
      height: 1080,
      source: 'MOCK',
      data: {
        remainingPlayers: 75,
        observedTeamCount: 21,
        teamEliminations: 2,
        zoneTimerSeconds: 229,
        zoneStage: 1,
        observerTeamsValue: 5,
        currentTeamTag: teamTags[0] ?? '777A',
        playerEliminations: 0,
        playerDamage: 325,
        playerAssists: 1,
        playerTags: teamTags.length > 0 ? teamTags : ['777A'],
        noise: dto.noise,
      },
    };

    let readings = 0;
    const events: AnalyzeResult['suggestedEvents'] = [];
    const uncertain: AnalyzeResult['uncertain'] = [];
    const seenFingerprints = new Set<string>();
    const seenUncertain = new Set<string>();
    const seenEvents = new Set<string>();
    const detections: AnalyzeResult['detections'] = [];

    for (let index = 0; index < iterations; index++) {
      const analysis = await engine.processFrame(
        profileConfig,
        provider,
        frame,
        { teamTags },
      );

      readings += analysis.readingsProcessed;

      for (const signal of analysis.uncertain) {
        const key = `${signal.roiKey}:${signal.kind}:${signal.reason}`;

        if (!seenUncertain.has(key)) {
          seenUncertain.add(key);
          uncertain.push(signal);
        }
      }

      for (const detection of analysis.detections) {
        if (!seenFingerprints.has(detection.fingerprint)) {
          seenFingerprints.add(detection.fingerprint);
          detections.push(detection);
        }

        if (detection.suggestedEvent) {
          const eventKey = `${detection.suggestedEvent.kind}:${JSON.stringify(
            detection.suggestedEvent.payload,
          )}`;

          if (!seenEvents.has(eventKey)) {
            seenEvents.add(eventKey);
            events.push(detection.suggestedEvent);
          }
        }
      }
    }

    return {
      matchId,
      profileId: profile.id,
      frameCount: iterations,
      readings,
      detections,
      uncertain,
      suggestedEvents: events,
    };
  }

  async start(matchId: string, dto: StartZoneOcrDto) {
    const match = await this.stateService.findMatch(matchId);

    if (!match) {
      throw new NotFoundException('Live match not found');
    }

    if (match.lockedAt) {
      throw new ConflictException('Live match is locked');
    }

    const mode = dto.mode ?? DEFAULTS.mode;

    if (mode === ZoneOcrMode.VIDEO) {
      throw new BadRequestException(
        'Video OCR is not calibrated yet. Provide PUBG Mobile observer footage and OCR dependencies, or run with mode=MOCK.',
      );
    }

    this.stop(matchId);

    const rule = await this.stateService.getRule(matchId);
    const intervalMs = dto.intervalMs ?? DEFAULTS.intervalMs;

    const detector = new MockZoneDetector({
      initialSeconds: dto.seconds ?? DEFAULTS.seconds,
      stepSeconds: Math.max(1, Math.round(intervalMs / 1000)),
      noise: dto.noise ?? DEFAULTS.noise,
    });

    const session: ZoneOcrSession = {
      matchId,
      mode,
      detector,
      interval: null,
      running: true,
      busy: false,
      tick: 0,
      phase: dto.initialPhase ?? 1,
      zoneCount: rule?.zoneCount ?? 8,
      intervalMs,
      minChangeSeconds: dto.minChangeSeconds ?? DEFAULTS.minChangeSeconds,
      confirmations: dto.confirmations ?? DEFAULTS.confirmations,
      resetJumpSeconds: dto.resetJumpSeconds ?? DEFAULTS.resetJumpSeconds,
      minConfidence: dto.minConfidence ?? DEFAULTS.minConfidence,
      lastCandidate: null,
      candidateCount: 0,
      lastEmittedSeconds: null,
      lastReadAt: null,
      lastSeconds: null,
      lastConfidence: null,
      lastRaw: null,
      readings: 0,
      emissions: 0,
      startedAt: new Date().toISOString(),
      stoppedAt: null,
      lastError: null,
    };

    this.sessions.set(matchId, session);

    await this.tick(session);

    session.interval = setInterval(() => {
      void this.tick(session);
    }, intervalMs);

    return this.toStatus(session);
  }

  stop(matchId: string) {
    const session = this.sessions.get(matchId);

    if (!session) {
      return null;
    }

    if (session.interval) {
      clearInterval(session.interval);
    }

    session.interval = null;
    session.running = false;
    session.stoppedAt = new Date().toISOString();
    session.detector.close();

    return this.toStatus(session);
  }

  status(matchId: string) {
    const session = this.sessions.get(matchId);

    if (!session) {
      return {
        running: false,
        mode: null,
        matchId,
        phase: null,
        zoneCount: null,
        lastSeconds: null,
        lastConfidence: null,
        lastRaw: null,
        lastReadAt: null,
        readings: 0,
        emissions: 0,
        startedAt: null,
        stoppedAt: null,
        lastError: null,
      };
    }

    return this.toStatus(session);
  }

  private async tick(session: ZoneOcrSession) {
    if (!session.running || session.busy) {
      return;
    }

    session.busy = true;

    try {
      const reading = await session.detector.read(session.tick++);

      session.lastReadAt = new Date().toISOString();
      session.lastConfidence = reading.confidence;
      session.lastRaw = reading.raw ?? null;
      session.readings++;

      if (
        reading.seconds === null ||
        reading.confidence < session.minConfidence
      ) {
        session.lastCandidate = null;
        session.candidateCount = 0;
        session.lastSeconds = reading.seconds;
        return;
      }

      const seconds = Math.max(0, Math.min(600, Math.round(reading.seconds)));

      session.lastSeconds = seconds;

      if (session.lastCandidate === seconds) {
        session.candidateCount++;
      } else {
        session.lastCandidate = seconds;
        session.candidateCount = 1;
      }

      if (session.candidateCount < session.confirmations) {
        return;
      }

      const state = await this.stateService.getState(session.matchId);

      if (state.status !== 'LIVE') {
        return;
      }

      if (
        session.lastEmittedSeconds !== null &&
        seconds > session.lastEmittedSeconds + session.resetJumpSeconds
      ) {
        const nextPhase = Math.min(session.zoneCount, session.phase + 1);

        if (nextPhase !== session.phase) {
          session.phase = nextPhase;
          await this.emit(session, MatchEventKind.ZONE_STARTED, {
            phase: nextPhase,
            ocr: true,
          });
        }
      }

      if (
        session.running &&
        (session.lastEmittedSeconds === null ||
          Math.abs(seconds - session.lastEmittedSeconds) >=
            session.minChangeSeconds)
      ) {
        await this.emit(session, MatchEventKind.ZONE_TIMER, {
          phase: session.phase,
          seconds,
          raw: reading.raw,
          ocr: true,
        });

        session.lastEmittedSeconds = seconds;
      }
    } catch (error) {
      session.lastError =
        error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `Zone OCR for match ${session.matchId} stopped: ${session.lastError}`,
      );

      this.stop(session.matchId);
    } finally {
      session.busy = false;
    }
  }

  private async emit(
    session: ZoneOcrSession,
    kind: MatchEventKind,
    payload: Record<string, unknown>,
  ) {
    if (!session.running) {
      return;
    }

    await this.eventsService.append(session.matchId, {
      kind,
      source: MatchEventSource.SYSTEM,
      confidence: session.lastConfidence ?? undefined,
      payload,
    });

    session.emissions++;
  }

  private toStatus(session: ZoneOcrSession) {
    return {
      running: session.running,
      mode: session.mode,
      matchId: session.matchId,
      phase: session.phase,
      zoneCount: session.zoneCount,
      intervalMs: session.intervalMs,
      lastSeconds: session.lastSeconds,
      lastConfidence: session.lastConfidence,
      lastRaw: session.lastRaw,
      lastReadAt: session.lastReadAt,
      readings: session.readings,
      emissions: session.emissions,
      startedAt: session.startedAt,
      stoppedAt: session.stoppedAt,
      lastError: session.lastError,
    };
  }

  onModuleDestroy() {
    for (const session of this.sessions.values()) {
      if (session.interval) {
        clearInterval(session.interval);
      }

      session.detector.close();
    }

    this.sessions.clear();
  }
}
