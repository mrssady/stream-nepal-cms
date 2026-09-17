import {
  LiveMatchStatus,
  MatchEventKind,
  MatchEventSource,
} from '@prisma/client';

export interface TeamStanding {
  teamId: string;
  shortName: string;
  teamName: string;
  slotNumber: number;
  kills: number;
  killAdjust: number;
  placement: number | null;
  placementPoints: number;
  pointAdjust: number;
  killPoints: number;
  matchPoints: number;
  eliminatedAt: string | null;
  alivePlayers: number;
  isWinner: boolean;
}

export interface PlayerSnapshot {
  playerId: string;
  inGameName: string;
  slotNumber: number;
  teamId: string;
  alive: boolean;
  kills: number;
}

export interface KillFeedEntry {
  id: string;
  seq: number;
  killerTeamId: string | null;
  killerPlayerId: string | null;
  killerInGameName: string | null;
  victimTeamId: string | null;
  victimPlayerId: string | null;
  victimInGameName: string | null;
  timestamp: string;
}

export interface PlacementEntry {
  teamId: string;
  shortName: string;
  teamName: string;
  slotNumber: number;
  placement: number;
}

export interface ZoneState {
  phase: number | null;
  startedAt: string | null;
  timerSeconds: number | null;
  timerSetAt: string | null;
}

export interface EventDerived {
  teamId?: string;
  teamName?: string;
  shortName?: string;
  placement?: number | null;
  placementPoints?: number;
  isWinner?: boolean;
  killerTeamId?: string | null;
  victimTeamId?: string | null;
  killerTeamShort?: string | null;
  victimTeamShort?: string | null;
}

export interface MatchEventRecord {
  id: string;
  seq: number;
  kind: MatchEventKind;
  source: MatchEventSource;
  confidence?: number | null;
  payload: Record<string, unknown>;
  timestamp: string;
  derived?: EventDerived;
}

export interface MatchState {
  matchId: string;
  matchName: string;
  matchNumber: number;
  round: string | null;
  status: LiveMatchStatus;
  seq: number;
  startedAt: string | null;
  endedAt: string | null;
  pausedAt: string | null;
  locked: boolean;
  winnerTeamId: string | null;
  zone: ZoneState;
  zoneCount: number;
  teams: Record<string, TeamStanding>;
  players: Record<string, PlayerSnapshot>;
  scoreboard: TeamStanding[];
  placements: PlacementEntry[];
  killFeed: KillFeedEntry[];
  events: MatchEventRecord[];
}

export interface SnapshotPayload {
  match: {
    id: string;
    name: string;
    tournamentId: string;
    tournamentName: string | null;
    game: string;
    matchNumber: number;
    round: string | null;
  };
  rule: {
    name: string;
    killPoint: number;
    booyahBonus: number;
    placementPoints: Record<string, number>;
    zoneCount: number;
  };
  state: MatchState;
  participantCount: number;
}
