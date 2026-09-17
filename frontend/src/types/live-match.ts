export type LiveMatchStatus =
  | "SCHEDULED"
  | "READY"
  | "LIVE"
  | "PAUSED"
  | "FINISHED"
  | "CANCELLED";

export type MatchEventKind =
  | "MATCH_STARTED"
  | "MATCH_READY"
  | "MATCH_PAUSED"
  | "MATCH_RESUMED"
  | "MATCH_FINISHED"
  | "MATCH_CANCELLED"
  | "PLAYER_KILLED"
  | "PLAYER_ELIMINATED"
  | "TEAM_ELIMINATED"
  | "PLACEMENT_CONFIRMED"
  | "PLACEMENT_SET"
  | "WINNER_DECLARED"
  | "MANUAL_CORRECTION"
  | "UNDO"
  | "MATCH_LOCKED"
  | "MATCH_REOPENED";

export type MatchEventSource = "MANUAL" | "SYSTEM";

export type LiveMatch = {
  id: string;
  name: string;
  tournamentId: string;
  matchNumber: number;
  round: string | null;
  status: LiveMatchStatus;
  startedAt: string | null;
  endedAt: string | null;
  lockedAt: string | null;
  eventSeq: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLiveMatchDto = {
  name: string;
  tournamentId: string;
  matchNumber: number;
  round?: string;
  notes?: string;
};

export type UpdateLiveMatchDto = {
  name?: string;
  matchNumber?: number;
  round?: string;
  notes?: string;
};

export type TeamStanding = {
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
};

export type PlayerSnapshot = {
  playerId: string;
  inGameName: string;
  slotNumber: number;
  teamId: string;
  alive: boolean;
  kills: number;
};

export type KillFeedEntry = {
  id: string;
  seq: number;
  killerTeamId: string | null;
  killerPlayerId: string | null;
  killerInGameName: string | null;
  victimTeamId: string | null;
  victimPlayerId: string | null;
  victimInGameName: string | null;
  timestamp: string;
};

export type PlacementEntry = {
  teamId: string;
  shortName: string;
  teamName: string;
  slotNumber: number;
  placement: number;
};

export type MatchEventRecord = {
  id: string;
  seq: number;
  kind: MatchEventKind;
  source: MatchEventSource;
  confidence: number | null;
  payload: Record<string, unknown>;
  timestamp: string;
};

export type MatchState = {
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
  teams: Record<string, TeamStanding>;
  players: Record<string, PlayerSnapshot>;
  scoreboard: TeamStanding[];
  placements: PlacementEntry[];
  killFeed: KillFeedEntry[];
  events: MatchEventRecord[];
};

export type SnapshotPayload = {
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
  };
  state: MatchState;
  participantCount: number;
};

export type AppendMatchEventDto = {
  kind: string;
  source?: MatchEventSource;
  confidence?: number;
  fingerprint?: string;
  payload?: Record<string, unknown>;
};

export type UndoLiveMatchDto = {
  eventId?: string;
  seq?: number;
};