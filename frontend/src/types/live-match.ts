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
  | "ZONE_STARTED"
  | "ZONE_TIMER"
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
  derived?: EventDerived;
};

export type EventDerived = {
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
};

export type ZoneState = {
  phase: number | null;
  startedAt: string | null;
  timerSeconds: number | null;
  timerSetAt: string | null;
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
  zone: ZoneState;
  zoneCount: number;
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
    zoneCount: number;
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

export type ZoneOcrMode = "MOCK" | "VIDEO";

export type StartZoneOcrDto = {
  mode?: ZoneOcrMode;
  intervalMs?: number;
  seconds?: number;
  initialPhase?: number;
  minChangeSeconds?: number;
  confirmations?: number;
  resetJumpSeconds?: number;
  minConfidence?: number;
  noise?: boolean;
  source?: string;
};

export type ZoneOcrStatus = {
  running: boolean;
  mode: ZoneOcrMode | null;
  matchId: string;
  phase: number | null;
  zoneCount: number | null;
  intervalMs?: number;
  lastSeconds: number | null;
  lastConfidence: number | null;
  lastRaw: string | null;
  lastReadAt: string | null;
  readings: number;
  emissions: number;
  startedAt: string | null;
  stoppedAt: string | null;
  lastError: string | null;
};

export type OcrConfidenceTier = "HIGH" | "REVIEW" | "REJECT";

export type OcrDetectionKind =
  | "MATCH_HEADER"
  | "TEAM_ELIMINATIONS"
  | "OBSERVER_PLAYER_LIST"
  | "ZONE_INFO"
  | "CURRENT_TEAM"
  | "PLAYER_STATS"
  | "UNKNOWN";

export type OcrSuggestedEvent = {
  kind: string;
  source: "SYSTEM";
  confidence: number;
  suggestedOnly: true;
  payload: Record<string, unknown>;
};

export type OcrConfirmedDetection = {
  roiKey: string;
  kind: OcrDetectionKind;
  value: Record<string, unknown>;
  confidence: number;
  tier: OcrConfidenceTier;
  rawText: string;
  timestamp: number;
  fingerprint: string;
  suggestedEvent?: OcrSuggestedEvent | null;
};

export type OcrUncertainReason =
  | "ALTERNATING_READINGS"
  | "AMBIGUOUS_TEAM"
  | "REVIEW_CONFIDENCE";

export type OcrUncertainSignal = {
  roiKey: string;
  kind: OcrDetectionKind;
  reason: OcrUncertainReason;
  candidates: Array<{ value: Record<string, unknown>; confidence: number }>;
  timestamp: number;
};

export type OcrFrameAnalysis = {
  frame: number;
  detections: OcrConfirmedDetection[];
  uncertain: OcrUncertainSignal[];
  readingsProcessed: number;
  at: number;
};

export type StartOcrMonitorDto = {
  profileId?: string;
  intervalMs?: number;
  confirmations?: number;
  dedupWindowMs?: number;
  noise?: boolean;
  progress?: boolean;
  seed?: number;
  confidenceBase?: number;
};

export type OcrMonitorStatus = {
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
  lastAnalysis: OcrFrameAnalysis | null;
};

export type OcrMonitorLatest = {
  matchId: string;
  running: boolean;
  analysis: OcrFrameAnalysis | null;
};

export type OcrOverlayRoi = {
  key: string;
  label: string;
  crop: { x: number; y: number; width: number; height: number };
  pipeline: {
    scale: number;
    grayscale: boolean;
    contrast: number;
    threshold: number;
    denoise: boolean;
  };
  enabled: boolean;
  ocr: boolean;
};

export type OcrOverlayPayload = {
  matchId: string;
  profileId: string;
  resolution: { width: number; height: number };
  reference: { width: number; height: number };
  rois: OcrOverlayRoi[];
  activeOcr: number;
};