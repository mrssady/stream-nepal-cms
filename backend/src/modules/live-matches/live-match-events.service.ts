import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';

import {
  MatchEvent,
  MatchEventKind,
  MatchEventSource,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

import { LiveMatchStateService } from './live-match-state.service';
import { LiveMatchRealtimeGateway } from './live-match-realtime.gateway';
import { AppendMatchEventDto } from './dto/append-match-event.dto';
import { UndoLiveMatchDto } from './dto/undo-live-match.dto';
import {
  EventDerived,
  MatchEventRecord,
  MatchState,
} from './types/match-state.interface';

const EVENT_UPPER_CASE = new Map<string, MatchEventKind>(
  Object.values(MatchEventKind).map((kind) => [kind.toUpperCase(), kind]),
);

interface RosterPlayer {
  playerId: string;
  inGameName: string;
  slotNumber: number;
}

interface RosterTeam {
  teamId: string;
  teamName: string;
  shortName: string;
  slotNumber: number;
  players: RosterPlayer[];
}

@Injectable()
export class LiveMatchEventsService {
  private readonly logger = new Logger(LiveMatchEventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateService: LiveMatchStateService,
    private readonly realtime: LiveMatchRealtimeGateway,
  ) {}

  private resolveKind(raw: string): MatchEventKind {
    const upper = raw.toUpperCase();
    const kind = EVENT_UPPER_CASE.get(upper);

    if (!kind) {
      throw new BadRequestException(`Unknown event kind "${raw}"`);
    }

    return kind;
  }

  private requirePayload(
    kind: MatchEventKind,
    payload: Record<string, unknown>,
    keys: string[],
  ) {
    for (const key of keys) {
      const value = payload[key];

      if (value === undefined || value === null) {
        throw new BadRequestException(
          `Missing required payload field "${key}" for event ${kind}`,
        );
      }
    }
  }

  private validateKindPayload(
    kind: MatchEventKind,
    payload: Record<string, unknown>,
  ): void {
    switch (kind) {
      case MatchEventKind.MATCH_READY: {
        if (!Array.isArray(payload.teams)) {
          throw new BadRequestException(
            'MATCH_READY requires a "teams" array in payload',
          );
        }
        break;
      }
      case MatchEventKind.PLAYER_KILLED: {
        this.requirePayload(kind, payload, ['killerId', 'victimId']);
        break;
      }
      case MatchEventKind.PLAYER_ELIMINATED: {
        this.requirePayload(kind, payload, ['victimId']);
        break;
      }
      case MatchEventKind.TEAM_ELIMINATED: {
        this.requirePayload(kind, payload, ['teamId']);
        break;
      }
      case MatchEventKind.PLACEMENT_CONFIRMED:
      case MatchEventKind.PLACEMENT_SET: {
        this.requirePayload(kind, payload, ['teamId', 'placement']);
        break;
      }
      case MatchEventKind.WINNER_DECLARED: {
        this.requirePayload(kind, payload, ['teamId']);
        break;
      }
      case MatchEventKind.MANUAL_CORRECTION: {
        this.requirePayload(kind, payload, ['targetTeamId', 'kind']);

        const correctionKind = payload.kind;

        if (
          correctionKind !== 'KILL_ADJUST' &&
          correctionKind !== 'POINTS_ADJUST' &&
          correctionKind !== 'PLACEMENT_ADJUST'
        ) {
          throw new BadRequestException(
            'MANUAL_CORRECTION "kind" must be KILL_ADJUST, POINTS_ADJUST or PLACEMENT_ADJUST',
          );
        }

        if (correctionKind === 'PLACEMENT_ADJUST') {
          this.requirePayload(kind, payload, ['placement']);
        } else {
          this.requirePayload(kind, payload, ['amount']);
        }
        break;
      }
      case MatchEventKind.ZONE_STARTED: {
        this.requirePayload(kind, payload, ['phase']);
        break;
      }
      case MatchEventKind.ZONE_TIMER: {
        this.requirePayload(kind, payload, ['seconds']);
        break;
      }
      case MatchEventKind.UNDO: {
        if (!payload.eventId && !payload.seq) {
          throw new BadRequestException(
            'UNDO requires "eventId" or "seq" in payload',
          );
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  private validateZonePayload(
    kind: MatchEventKind,
    payload: Record<string, unknown>,
    zoneCount: number,
  ): void {
    const phase = payload.phase;

    if (phase !== undefined) {
      if (
        typeof phase !== 'number' ||
        !Number.isInteger(phase) ||
        phase < 1 ||
        phase > zoneCount
      ) {
        throw new BadRequestException(
          `Zone "phase" must be an integer from 1 to ${zoneCount}`,
        );
      }
    }

    if (kind === MatchEventKind.ZONE_TIMER) {
      const seconds = payload.seconds;

      if (
        typeof seconds !== 'number' ||
        !Number.isInteger(seconds) ||
        seconds < 0 ||
        seconds > 600
      ) {
        throw new BadRequestException(
          'Zone "seconds" must be an integer from 0 to 600',
        );
      }
    }

    if (kind === MatchEventKind.ZONE_STARTED && typeof phase !== 'number') {
      throw new BadRequestException(
        'ZONE_STARTED requires a numeric "phase" in payload',
      );
    }
  }

  private deriveContext(
    kind: MatchEventKind,
    payload: Record<string, unknown>,
    state: MatchState,
  ): EventDerived | undefined {
    const teamId =
      typeof payload.teamId === 'string'
        ? payload.teamId
        : typeof payload.targetTeamId === 'string'
          ? payload.targetTeamId
          : null;

    if (teamId && state.teams[teamId]) {
      const team = state.teams[teamId];

      return {
        teamId,
        teamName: team.teamName,
        shortName: team.shortName,
        placement: team.placement,
        placementPoints: team.placementPoints,
        isWinner: team.isWinner,
      };
    }

    if (kind === MatchEventKind.PLAYER_KILLED) {
      const killerId =
        typeof payload.killerId === 'string' ? payload.killerId : null;
      const victimId =
        typeof payload.victimId === 'string' ? payload.victimId : null;

      const killerTeamId = killerId
        ? (state.players[killerId]?.teamId ?? null)
        : null;
      const victimTeamId = victimId
        ? (state.players[victimId]?.teamId ?? null)
        : null;

      return {
        killerTeamId,
        victimTeamId,
        killerTeamShort: killerTeamId
          ? (state.teams[killerTeamId]?.shortName ?? null)
          : null,
        victimTeamShort: victimTeamId
          ? (state.teams[victimTeamId]?.shortName ?? null)
          : null,
      };
    }

    return undefined;
  }

  private autoFingerprint(
    matchId: string,
    kind: MatchEventKind,
    payload: Record<string, unknown>,
  ): string | null {
    if (kind !== MatchEventKind.PLAYER_KILLED) {
      return null;
    }

    const killerId =
      typeof payload.killerId === 'string' ? payload.killerId : null;
    const victimId =
      typeof payload.victimId === 'string' ? payload.victimId : null;

    if (!killerId || !victimId) {
      return null;
    }

    return `kill:${killerId}:${victimId}:${matchId}`;
  }

  private statusFor(
    kind: MatchEventKind,
  ): Prisma.LiveMatchUpdateInput['status'] | null {
    switch (kind) {
      case MatchEventKind.MATCH_READY:
        return 'READY';
      case MatchEventKind.MATCH_STARTED:
        return 'LIVE';
      case MatchEventKind.MATCH_PAUSED:
        return 'PAUSED';
      case MatchEventKind.MATCH_RESUMED:
        return 'LIVE';
      case MatchEventKind.MATCH_FINISHED:
        return 'FINISHED';
      case MatchEventKind.MATCH_CANCELLED:
        return 'CANCELLED';
      default:
        return null;
    }
  }

  private toRecord(event: {
    id: string;
    seq: number;
    kind: MatchEventKind;
    source: MatchEventSource;
    confidence: number | null;
    payload: Prisma.JsonValue;
    timestamp: Date;
  }): MatchEventRecord {
    return {
      id: event.id,
      seq: event.seq,
      kind: event.kind,
      source: event.source,
      confidence: event.confidence,
      payload: (event.payload as Record<string, unknown>) ?? {},
      timestamp: event.timestamp.toISOString(),
    };
  }

  async append(
    matchId: string,
    dto: AppendMatchEventDto,
    actor?: AuthenticatedUser,
  ): Promise<{ event: MatchEventRecord; state: MatchState }> {
    return this.stateService.runExclusive(matchId, async () => {
      const match = await this.stateService.findMatch(matchId);

      const kind = this.resolveKind(dto.kind);

      if (match.lockedAt && kind !== MatchEventKind.MATCH_REOPENED) {
        throw new ConflictException('Live match is locked');
      }

      const payload: Record<string, unknown> = { ...(dto.payload ?? {}) };

      this.validateKindPayload(kind, payload);

      if (
        kind === MatchEventKind.ZONE_STARTED ||
        kind === MatchEventKind.ZONE_TIMER
      ) {
        const rule = await this.stateService.getRule(matchId);
        this.validateZonePayload(kind, payload, rule?.zoneCount ?? 8);
      }

      if (actor) {
        const user = await this.prisma.user.findUnique({
          where: { id: actor.id },
          select: { name: true },
        });

        payload.actorId = actor.id;
        payload.actorName = user?.name ?? actor.email;
      }

      const source = dto.source ?? MatchEventSource.MANUAL;
      const fingerprint =
        dto.fingerprint ?? this.autoFingerprint(matchId, kind, payload);

      const nextSeq = match.eventSeq + 1;

      let event: MatchEvent;

      try {
        event = await this.prisma.matchEvent.create({
          data: {
            matchId,
            seq: nextSeq,
            kind,
            source,
            confidence: dto.confidence,
            payload: payload as unknown as Prisma.InputJsonValue,
            fingerprint,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          String(error.meta?.target).includes('fingerprint')
        ) {
          throw new ConflictException('Duplicate event detected');
        }

        throw error;
      }

      const derived = this.statusFor(kind);

      await this.prisma.liveMatch.update({
        where: { id: matchId },
        data: {
          eventSeq: nextSeq,
          ...(derived ? { status: derived } : {}),
          ...(kind === MatchEventKind.MATCH_STARTED
            ? { startedAt: new Date() }
            : {}),
          ...(kind === MatchEventKind.MATCH_FINISHED
            ? { endedAt: new Date() }
            : {}),
          ...(kind === MatchEventKind.MATCH_CANCELLED
            ? { endedAt: new Date() }
            : {}),
          ...(kind === MatchEventKind.MATCH_LOCKED
            ? { lockedAt: new Date() }
            : {}),
          ...(kind === MatchEventKind.MATCH_REOPENED ? { lockedAt: null } : {}),
        },
      });

      const state = await this.stateService.recompute(matchId);
      const record = this.toRecord(event);
      const enriched = this.deriveContext(kind, payload, state);

      this.realtime.emitEvent(
        matchId,
        enriched ? { ...record, derived: enriched } : record,
      );
      this.realtime.notify(matchId);

      return { event: record, state };
    });
  }

  private async buildRoster(matchId: string): Promise<{ teams: RosterTeam[] }> {
    const match = await this.stateService.findMatch(matchId);

    const registrations = await this.prisma.registration.findMany({
      where: {
        tournamentId: match.tournamentId,
        registrationStatus: 'APPROVED',
        team: { isNot: null },
      },
      include: {
        team: {
          include: {
            players: {
              orderBy: { slotNumber: 'asc' },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const teams: RosterTeam[] = registrations
      .filter((registration) => registration.team)
      .map((registration, index) => {
        const team = registration.team!;

        const players: RosterPlayer[] = team.players.map((player) => ({
          playerId: player.id,
          inGameName: player.inGameName,
          slotNumber: player.slotNumber,
        }));

        return {
          teamId: team.id,
          teamName: team.teamName,
          shortName: team.shortName ?? team.teamName.slice(0, 4).toUpperCase(),
          slotNumber: team.slotNumber || index + 1,
          players,
        };
      });

    return { teams };
  }

  async ready(
    matchId: string,
    actor?: AuthenticatedUser,
  ): Promise<{ event: MatchEventRecord; state: MatchState }> {
    const match = await this.stateService.findMatch(matchId);

    if (match.lockedAt) {
      throw new ConflictException('Live match is locked');
    }

    const payload = await this.buildRoster(matchId);

    if (payload.teams.length === 0) {
      throw new BadRequestException(
        'No approved tournament teams found to build the roster',
      );
    }

    return this.append(
      matchId,
      {
        kind: MatchEventKind.MATCH_READY,
        source: MatchEventSource.SYSTEM,
        payload,
      },
      actor,
    );
  }

  async undo(
    matchId: string,
    dto: UndoLiveMatchDto,
    actor?: AuthenticatedUser,
  ): Promise<{ event: MatchEventRecord; state: MatchState }> {
    const payload: Record<string, unknown> = {};

    if (dto.eventId) {
      payload.eventId = dto.eventId;
    }

    if (dto.seq) {
      payload.seq = dto.seq;
    }

    return this.append(
      matchId,
      {
        kind: MatchEventKind.UNDO,
        source: MatchEventSource.MANUAL,
        payload,
      },
      actor,
    );
  }

  async lock(
    matchId: string,
    reason: string | undefined,
    actor?: AuthenticatedUser,
  ) {
    return this.append(
      matchId,
      {
        kind: MatchEventKind.MATCH_LOCKED,
        source: MatchEventSource.MANUAL,
        payload: reason ? { reason } : {},
      },
      actor,
    );
  }

  async reopen(
    matchId: string,
    reason: string | undefined,
    actor?: AuthenticatedUser,
  ) {
    return this.append(
      matchId,
      {
        kind: MatchEventKind.MATCH_REOPENED,
        source: MatchEventSource.MANUAL,
        payload: reason ? { reason } : {},
      },
      actor,
    );
  }
}
