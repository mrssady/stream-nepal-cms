import { Injectable, Logger } from '@nestjs/common';

import {
  LiveMatch,
  LiveMatchStatus,
  MatchEvent,
  MatchEventKind,
  ScoringRule,
} from '@prisma/client';

import {
  KillFeedEntry,
  MatchState,
  MatchEventRecord,
  PlacementEntry,
  PlayerSnapshot,
  TeamStanding,
  ZoneState,
} from './types/match-state.interface';

export interface RosterTeamPlayer {
  playerId: string;
  inGameName: string;
  slotNumber: number;
}

export interface RosterTeam {
  teamId: string;
  teamName: string;
  shortName: string;
  slotNumber: number;
  players: RosterTeamPlayer[];
}

export interface RosterPayload {
  teams: RosterTeam[];
}

const FALLBACK_PLACEMENT_POINTS: Record<string, number> = {
  '1': 12,
  '2': 10,
  '3': 8,
  '4': 6,
  '5': 5,
  '6': 4,
  '7': 3,
  '8': 2,
  '9': 1,
  '10': 1,
  '11': 1,
  '12': 1,
};

@Injectable()
export class LiveMatchScoringService {
  private readonly logger = new Logger(LiveMatchScoringService.name);

  private toRecord(event: MatchEvent): MatchEventRecord {
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

  private placementPointsOf(rule: ScoringRule | null): Record<string, number> {
    if (!rule) {
      return FALLBACK_PLACEMENT_POINTS;
    }

    const raw = rule.placementPoints as
      Record<string, number> | null | undefined;

    if (raw && typeof raw === 'object') {
      return raw;
    }

    return FALLBACK_PLACEMENT_POINTS;
  }

  private collectUndone(events: MatchEventRecord[]): Set<string> {
    const undone = new Set<string>();

    for (const event of events) {
      if (event.kind !== MatchEventKind.UNDO) {
        continue;
      }

      const targetId = event.payload.eventId;
      const targetSeq = event.payload.seq;

      if (typeof targetId === 'string') {
        undone.add(targetId);
      } else if (typeof targetSeq === 'number') {
        const found = events.find((item) => item.seq === targetSeq);
        if (found) {
          undone.add(found.id);
        }
      }
    }

    return undone;
  }

  private str(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
  }

  private num(value: unknown): number | null {
    return typeof value === 'number' ? value : null;
  }

  computeState(
    match: LiveMatch,
    rule: ScoringRule | null,
    dbEvents: MatchEvent[],
  ): MatchState {
    const record = dbEvents.map((event) => this.toRecord(event));

    const undone = this.collectUndone(record);
    const events = record.filter((event) => !undone.has(event.id));

    const teams: Record<string, TeamStanding> = {};
    const players: Record<string, PlayerSnapshot> = {};
    const killFeed: KillFeedEntry[] = [];
    const placements: PlacementEntry[] = [];
    const placementMap = this.placementPointsOf(rule);

    const killPoint = rule?.killPoint ?? 1;
    const booyahBonus = rule?.booyahBonus ?? 0;

    let status: LiveMatchStatus = LiveMatchStatus.SCHEDULED;
    let startedAt: string | null = null;
    let endedAt: string | null = null;
    let pausedAt: string | null = null;
    let winnerTeamId: string | null = null;
    let locked = false;
    let totalTeams = 0;
    let zone: ZoneState = {
      phase: null,
      startedAt: null,
      timerSeconds: null,
      timerSetAt: null,
    };

    const ensureTeam = (teamId: string, roster?: RosterTeam): TeamStanding => {
      if (!teams[teamId]) {
        teams[teamId] = {
          teamId,
          shortName: roster?.shortName ?? '',
          teamName: roster?.teamName ?? '',
          slotNumber: roster?.slotNumber ?? 0,
          kills: 0,
          killAdjust: 0,
          placement: null,
          placementPoints: 0,
          pointAdjust: 0,
          killPoints: 0,
          matchPoints: 0,
          eliminatedAt: null,
          alivePlayers: 0,
          isWinner: false,
        };
      }

      if (roster) {
        teams[teamId].shortName = roster.shortName;
        teams[teamId].teamName = roster.teamName;
        teams[teamId].slotNumber = roster.slotNumber;
      }

      return teams[teamId];
    };

    const teamIdOfPlayer = (playerId: string): string | null => {
      if (players[playerId]) {
        return players[playerId].teamId;
      }

      return null;
    };

    const placeTeam = (teamId: string): number => {
      const team = ensureTeam(teamId);

      if (team.placement !== null) {
        return team.placement;
      }

      const assignedAlready = placements.length;
      const placement = totalTeams - assignedAlready;

      team.placement = placement;
      team.eliminatedAt = new Date().toISOString();
      team.placementPoints = placementMap[String(placement)] ?? 0;

      if (placement === 1 && booyahBonus > 0) {
        team.placementPoints += booyahBonus;
      }

      placements.push({
        teamId,
        shortName: team.shortName,
        teamName: team.teamName,
        slotNumber: team.slotNumber,
        placement,
      });

      return placement;
    };

    const applyExecution = (event: MatchEventRecord): void => {
      const payload = event.payload ?? {};
      const isKillEvent = event.kind === MatchEventKind.PLAYER_KILLED;

      if (isKillEvent || event.kind === MatchEventKind.PLAYER_ELIMINATED) {
        const killerId = this.str(payload.killerId);
        const victimId = this.str(payload.victimId);

        if (isKillEvent) {
          const killerTeamId =
            this.str(payload.killerTeamId) ??
            (killerId ? teamIdOfPlayer(killerId) : null);

          if (killerId) {
            const killer = players[killerId];
            if (killer) {
              killer.kills += 1;
            }
          }

          if (killerTeamId) {
            ensureTeam(killerTeamId).kills += 1;
          }

          killFeed.push({
            id: event.id,
            seq: event.seq,
            killerTeamId,
            killerPlayerId: killerId,
            killerInGameName: killerId
              ? (players[killerId]?.inGameName ?? null)
              : null,
            victimTeamId: victimId ? teamIdOfPlayer(victimId) : null,
            victimPlayerId: victimId,
            victimInGameName: victimId
              ? (players[victimId]?.inGameName ?? null)
              : null,
            timestamp: new Date(event.timestamp).toISOString(),
          });
        }

        if (victimId && players[victimId]) {
          players[victimId].alive = false;

          const victimTeamId = teamIdOfPlayer(victimId);

          if (victimTeamId) {
            const team = ensureTeam(victimTeamId);
            team.alivePlayers = Math.max(0, team.alivePlayers - 1);

            if (team.alivePlayers === 0 && team.placement === null) {
              placeTeam(victimTeamId);
            }
          }
        }
      } else if (event.kind === MatchEventKind.TEAM_ELIMINATED) {
        const teamId = this.str(payload.teamId);

        if (teamId) {
          const explicit = this.num(payload.placement);
          const team = ensureTeam(teamId);
          team.alivePlayers = 0;

          if (team.placement === null && explicit !== null) {
            team.placement = explicit;
            team.placementPoints = placementMap[String(explicit)] ?? 0;

            if (explicit === 1 && booyahBonus > 0) {
              team.placementPoints += booyahBonus;
            }

            placements.push({
              teamId: team.teamId,
              shortName: team.shortName,
              teamName: team.teamName,
              slotNumber: team.slotNumber,
              placement: explicit,
            });
          } else if (team.placement === null) {
            placeTeam(teamId);
          }
        }
      } else if (
        event.kind === MatchEventKind.PLACEMENT_CONFIRMED ||
        event.kind === MatchEventKind.PLACEMENT_SET
      ) {
        const teamId = this.str(payload.teamId);
        const placement = this.num(payload.placement);

        if (teamId && placement) {
          const team = ensureTeam(teamId);
          team.alivePlayers = 0;
          team.eliminatedAt = new Date().toISOString();

          if (team.placement === null || !payload.noOverride) {
            team.placement = placement;
            team.placementPoints = placementMap[String(placement)] ?? 0;

            if (placement === 1 && booyahBonus > 0) {
              team.placementPoints += booyahBonus;
            }

            const existingIndex = placements.findIndex(
              (item) => item.teamId === teamId,
            );

            if (existingIndex >= 0) {
              placements.splice(existingIndex, 1);
            }

            placements.push({
              teamId,
              shortName: team.shortName,
              teamName: team.teamName,
              slotNumber: team.slotNumber,
              placement,
            });
          }
        }
      } else if (event.kind === MatchEventKind.WINNER_DECLARED) {
        const teamId = this.str(payload.teamId);

        if (teamId) {
          winnerTeamId = teamId;
          const team = ensureTeam(teamId);
          team.isWinner = true;
          team.alivePlayers = Math.max(team.alivePlayers, 1);

          if (team.placement === null) {
            team.placement = 1;
            team.placementPoints =
              (placementMap['1'] ?? 0) + (booyahBonus > 0 ? booyahBonus : 0);

            placements.push({
              teamId,
              shortName: team.shortName,
              teamName: team.teamName,
              slotNumber: team.slotNumber,
              placement: 1,
            });
          }
        }
      } else if (event.kind === MatchEventKind.MANUAL_CORRECTION) {
        const teamId = this.str(payload.targetTeamId);

        if (teamId) {
          const team = ensureTeam(teamId);
          const kind = this.str(payload.kind);
          const amount = this.num(payload.amount) ?? 0;

          if (kind === 'KILL_ADJUST') {
            team.killAdjust += amount;
          } else if (kind === 'POINTS_ADJUST') {
            team.pointAdjust += amount;
          } else if (kind === 'PLACEMENT_ADJUST') {
            const placement = this.num(payload.placement);

            if (placement) {
              team.placement = placement;
              team.placementPoints = placementMap[String(placement)] ?? 0;

              if (placement === 1 && booyahBonus > 0) {
                team.placementPoints += booyahBonus;
              }
            }
          }
        }
      }
    };

    for (const event of events) {
      const payload = event.payload ?? {};

      switch (event.kind) {
        case MatchEventKind.MATCH_READY: {
          status = LiveMatchStatus.READY;

          const roster = payload as unknown as RosterPayload;
          if (Array.isArray(roster.teams)) {
            totalTeams = roster.teams.length;

            for (const rosterTeam of roster.teams) {
              ensureTeam(rosterTeam.teamId, rosterTeam);

              for (const rosterPlayer of rosterTeam.players) {
                players[rosterPlayer.playerId] = {
                  playerId: rosterPlayer.playerId,
                  inGameName: rosterPlayer.inGameName,
                  slotNumber: rosterPlayer.slotNumber,
                  teamId: rosterTeam.teamId,
                  alive: true,
                  kills: 0,
                };
              }
            }

            for (const team of Object.values(teams)) {
              team.alivePlayers = 0;

              for (const player of Object.values(players)) {
                if (player.teamId === team.teamId) {
                  team.alivePlayers += 1;
                }
              }
            }
          }

          break;
        }
        case MatchEventKind.MATCH_STARTED: {
          status = LiveMatchStatus.LIVE;
          startedAt = startedAt ?? new Date(event.timestamp).toISOString();
          pausedAt = null;
          break;
        }
        case MatchEventKind.MATCH_PAUSED: {
          status = LiveMatchStatus.PAUSED;
          pausedAt = pausedAt ?? new Date(event.timestamp).toISOString();
          break;
        }
        case MatchEventKind.MATCH_RESUMED: {
          status = LiveMatchStatus.LIVE;
          pausedAt = null;
          break;
        }
        case MatchEventKind.MATCH_FINISHED: {
          status = LiveMatchStatus.FINISHED;
          endedAt = endedAt ?? new Date(event.timestamp).toISOString();

          if (winnerTeamId) {
            placeTeam(winnerTeamId);
          } else {
            const remaining = Object.values(teams).filter(
              (team) => team.placement === null,
            );

            if (remaining.length === 1) {
              placeTeam(remaining[0].teamId);
            } else if (remaining.length > 1) {
              for (const team of remaining) {
                team.alivePlayers = Math.max(team.alivePlayers, 0);
              }
            }
          }

          break;
        }
        case MatchEventKind.MATCH_CANCELLED: {
          status = LiveMatchStatus.CANCELLED;
          endedAt = endedAt ?? new Date(event.timestamp).toISOString();
          break;
        }
        case MatchEventKind.MATCH_LOCKED: {
          locked = true;
          break;
        }
        case MatchEventKind.MATCH_REOPENED: {
          locked = false;
          break;
        }
        case MatchEventKind.ZONE_STARTED: {
          const phase = this.num(payload.phase);

          if (phase !== null && phase >= 1) {
            zone = {
              ...zone,
              phase,
              startedAt: new Date(event.timestamp).toISOString(),
            };
          }

          break;
        }
        case MatchEventKind.ZONE_TIMER: {
          const seconds = this.num(payload.seconds);
          const phase = this.num(payload.phase);

          if (seconds !== null && seconds >= 0) {
            zone = {
              ...zone,
              phase: phase && phase >= 1 ? phase : zone.phase,
              timerSeconds: seconds,
              timerSetAt: new Date(event.timestamp).toISOString(),
            };
          }

          break;
        }
        default: {
          applyExecution(event);
          break;
        }
      }
    }

    const ranked = Object.values(teams).map((team) => {
      const killPoints = team.kills + team.killAdjust;
      const placementPoints = team.placementPoints;
      const matchPoints =
        killPoints * killPoint + placementPoints + team.pointAdjust;

      return {
        ...team,
        killPoints,
        placementPoints,
        matchPoints,
        isWinner: team.teamId === winnerTeamId,
      };
    });

    ranked.sort((a, b) => {
      if (b.matchPoints !== a.matchPoints) {
        return b.matchPoints - a.matchPoints;
      }

      if (b.killPoints !== a.killPoints) {
        return b.killPoints - a.killPoints;
      }

      const aPlacement = a.placement ?? Number.MAX_SAFE_INTEGER;
      const bPlacement = b.placement ?? Number.MAX_SAFE_INTEGER;

      if (aPlacement !== bPlacement) {
        return aPlacement - bPlacement;
      }

      return a.slotNumber - b.slotNumber;
    });

    const scoreboard: TeamStanding[] = ranked;

    const state: MatchState = {
      matchId: match.id,
      matchName: match.name,
      matchNumber: match.matchNumber,
      round: match.round,
      status,
      seq: record.length > 0 ? record[record.length - 1].seq : 0,
      startedAt,
      endedAt,
      pausedAt,
      locked,
      winnerTeamId,
      zone,
      zoneCount: rule?.zoneCount ?? 8,
      teams,
      players,
      scoreboard,
      placements: placements.sort((a, b) => a.placement - b.placement),
      killFeed,
      events: record,
    };

    return state;
  }
}
