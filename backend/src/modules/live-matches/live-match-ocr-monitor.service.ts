import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';

import { OcrProfilesService } from './ocr-profiles.service';
import { type OcrProfileConfig, REFERENCE_RESOLUTION } from './ocr/ocr-config';
import { prepareRois, type PreparedRoi } from './ocr/ocr-preprocessor';
import { OcrAnalysisEngine } from './ocr/ocr-engine';
import { MockSpectatorProvider } from './ocr/mock-spectator-provider';
import { buildMonitorScene } from './ocr/ocr-monitor-scene';
import {
  type AnalyzeResult,
  type FrameAnalysis,
  type OcrFrame,
} from './ocr/ocr-types';
import { LiveMatchRealtimeGateway } from './live-match-realtime.gateway';
import { LiveMatchStateService } from './live-match-state.service';

interface OcrMonitorSession {
  matchId: string;
  profileId: string;
  profileConfig: OcrProfileConfig;
  teamTags: string[];
  engine: OcrAnalysisEngine;
  provider: MockSpectatorProvider;
  interval: NodeJS.Timeout | null;
  running: boolean;
  busy: boolean;
  intervalMs: number;
  noise: boolean;
  progress: boolean;
  tick: number;
  frameCount: number;
  readings: number;
  detections: number;
  uncertainSignals: number;
  suggestedEvents: number;
  startedAt: string;
  stoppedAt: string | null;
  lastError: string | null;
  lastAnalysis: FrameAnalysis | null;
}

export interface OcrMonitorStatus {
  running: boolean;
  matchId: string;
  profileId: string | null;
  provider: string | null;
  intervalMs: number | null;
  frameCount: number;
  tick: number;
  readings: number;
  detections: number;
  uncertainSignals: number;
  suggestedEvents: number;
  startedAt: string | null;
  stoppedAt: string | null;
  lastError: string | null;
  lastAnalysis: FrameAnalysis | null;
}

@Injectable()
export class LiveMatchOcrMonitorService implements OnModuleDestroy {
  private readonly logger = new Logger(LiveMatchOcrMonitorService.name);
  private readonly monitors = new Map<string, OcrMonitorSession>();

  constructor(
    private readonly stateService: LiveMatchStateService,
    private readonly profilesService: OcrProfilesService,
    private readonly gateway: LiveMatchRealtimeGateway,
  ) {}

  async start(
    matchId: string,
    dto: {
      profileId?: string;
      intervalMs?: number;
      confirmations?: number;
      dedupWindowMs?: number;
      noise?: boolean;
      progress?: boolean;
      seed?: number;
      confidenceBase?: number;
    },
  ): Promise<OcrMonitorStatus> {
    const match = await this.stateService.findMatch(matchId);

    if (!match) {
      throw new NotFoundException('Live match not found');
    }

    if (match.lockedAt) {
      throw new BadRequestException('Live match is locked');
    }

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

    const profileConfig = profile.config as unknown as OcrProfileConfig;

    this.stop(matchId);

    const intervalMs = Math.min(10000, Math.max(100, dto.intervalMs ?? 1000));

    const session: OcrMonitorSession = {
      matchId,
      profileId: profile.id,
      profileConfig,
      teamTags,
      engine: new OcrAnalysisEngine({
        confirmations: dto.confirmations ?? 3,
        dedupWindowMs: dto.dedupWindowMs ?? 1500,
      }),
      provider: new MockSpectatorProvider({
        seed: dto.seed ?? 2024,
        noiseProbability: dto.noise ? 0.1 : 0,
        confidenceBase: dto.confidenceBase ?? 0.96,
      }),
      interval: null,
      running: true,
      busy: false,
      intervalMs,
      noise: dto.noise ?? false,
      progress: dto.progress ?? true,
      tick: 0,
      frameCount: 0,
      readings: 0,
      detections: 0,
      uncertainSignals: 0,
      suggestedEvents: 0,
      startedAt: new Date().toISOString(),
      stoppedAt: null,
      lastError: null,
      lastAnalysis: null,
    };

    this.monitors.set(matchId, session);

    await this.tick(session);

    session.interval = setInterval(() => {
      void this.tick(session);
    }, intervalMs);

    return this.toStatus(session);
  }

  stop(matchId: string): OcrMonitorStatus {
    const session = this.monitors.get(matchId);

    if (!session) {
      return this.status(matchId);
    }

    if (session.interval) {
      clearInterval(session.interval);
    }

    session.interval = null;
    session.running = false;
    session.stoppedAt = new Date().toISOString();

    return this.toStatus(session);
  }

  status(matchId: string): OcrMonitorStatus {
    const session = this.monitors.get(matchId);

    if (!session) {
      return {
        running: false,
        matchId,
        profileId: null,
        provider: null,
        intervalMs: null,
        frameCount: 0,
        tick: 0,
        readings: 0,
        detections: 0,
        uncertainSignals: 0,
        suggestedEvents: 0,
        startedAt: null,
        stoppedAt: null,
        lastError: null,
        lastAnalysis: null,
      };
    }

    return this.toStatus(session);
  }

  latest(matchId: string): {
    matchId: string;
    running: boolean;
    analysis: FrameAnalysis | null;
  } {
    const session = this.monitors.get(matchId);

    return {
      matchId,
      running: session?.running ?? false,
      analysis: session?.lastAnalysis ?? null,
    };
  }

  // ROI debug overlay (spec 23): resolved capture regions for the profile in
  // use, scaled to the requested frame size. Frontend draws these as boxes
  // over a placeholder to verify the calibration before real frames exist.
  async overlay(
    matchId: string,
    target: { width?: number; height?: number; profileId?: string },
  ): Promise<{
    matchId: string;
    profileId: string;
    resolution: { width: number; height: number };
    reference: { width: number; height: number };
    rois: PreparedRoi[];
    activeOcr: number;
  }> {
    const match = await this.stateService.findMatch(matchId);

    const profileId =
      target.profileId ??
      (await this.profilesService.resolveDefaultForGame(match.tournament.game));

    const profile = await this.profilesService.findOne(profileId);

    if (!profile) {
      throw new NotFoundException('OCR profile not found');
    }

    const resolution = {
      width: target.width ?? profile.width,
      height: target.height ?? profile.height,
    };

    const config = profile.config as unknown as OcrProfileConfig;
    const rois = prepareRois(config, resolution);
    const reference = REFERENCE_RESOLUTION;
    const activeOcr = rois.filter((roi) => roi.enabled && roi.ocr).length;

    return {
      matchId,
      profileId: profile.id,
      resolution,
      reference: {
        width: reference.width,
        height: reference.height,
      },
      rois,
      activeOcr,
    };
  }

  private async tick(session: OcrMonitorSession): Promise<void> {
    if (!session.running || session.busy) {
      return;
    }

    session.busy = true;

    try {
      const scene = buildMonitorScene(session.tick, session.teamTags);

      const frame: OcrFrame = {
        width: 1920,
        height: 1080,
        source: 'MOCK',
        data: scene,
      };

      const analysis = await session.engine.processFrame(
        session.profileConfig,
        session.provider,
        frame,
        { teamTags: session.teamTags },
      );

      session.tick += 1;
      session.frameCount += 1;
      session.readings += analysis.readingsProcessed;
      session.detections += analysis.detections.length;
      session.uncertainSignals += analysis.uncertain.length;

      for (const detection of analysis.detections) {
        if (detection.suggestedEvent) {
          session.suggestedEvents += 1;
        }
      }

      session.lastAnalysis = analysis;

      this.gateway.emitAnalysis(session.matchId, analysis);
    } catch (error) {
      session.lastError =
        error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `OCR monitor for match ${session.matchId} stopped: ${session.lastError}`,
      );

      this.stop(session.matchId);
    } finally {
      session.busy = false;
    }
  }

  private toStatus(session: OcrMonitorSession): OcrMonitorStatus {
    return {
      running: session.running,
      matchId: session.matchId,
      profileId: session.profileId ?? null,
      provider: session.provider?.id ?? null,
      intervalMs: session.intervalMs ?? null,
      frameCount: session.frameCount,
      tick: session.tick,
      readings: session.readings,
      detections: session.detections,
      uncertainSignals: session.uncertainSignals,
      suggestedEvents: session.suggestedEvents,
      startedAt: session.startedAt ?? null,
      stoppedAt: session.stoppedAt ?? null,
      lastError: session.lastError ?? null,
      lastAnalysis: session.lastAnalysis ?? null,
    };
  }

  onModuleDestroy() {
    for (const session of this.monitors.values()) {
      if (session.interval) {
        clearInterval(session.interval);
      }
    }

    this.monitors.clear();
  }
}

export type { AnalyzeResult };
