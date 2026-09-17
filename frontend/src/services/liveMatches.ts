import api from "./api";

import {
  type AppendMatchEventDto,
  type CreateLiveMatchDto,
  type LiveMatch,
  type MatchEventRecord,
  type MatchState,
  type SnapshotPayload,
  type StartZoneOcrDto,
  type UndoLiveMatchDto,
  type UpdateLiveMatchDto,
  type ZoneOcrStatus,
} from "@/types/live-match";

export async function getLiveMatches(
  tournamentId?: string,
): Promise<LiveMatch[]> {
  const response = await api.get(
    "/live-matches",
    tournamentId ? { params: { tournamentId } } : undefined,
  );

  return response.data.data;
}

export async function getLiveMatch(
  id: string,
): Promise<{ match: LiveMatch; state: MatchState }> {
  const response = await api.get(`/live-matches/${id}`);

  return response.data.data;
}

export async function getLiveMatchState(
  id: string,
): Promise<MatchState> {
  const response = await api.get(`/live-matches/${id}/state`);

  return response.data.data;
}

export async function getLiveMatchSnapshot(
  id: string,
): Promise<SnapshotPayload> {
  const response = await api.get(`/live-matches/${id}/snapshot`);

  return response.data.data;
}

export async function createLiveMatch(
  data: CreateLiveMatchDto,
): Promise<LiveMatch> {
  const response = await api.post("/live-matches", data);

  return response.data.data;
}

export async function updateLiveMatch(
  id: string,
  data: UpdateLiveMatchDto,
): Promise<LiveMatch> {
  const response = await api.patch(`/live-matches/${id}`, data);

  return response.data.data;
}

export async function deleteLiveMatch(
  id: string,
): Promise<void> {
  await api.delete(`/live-matches/${id}`);
}

export async function appendMatchEvent(
  id: string,
  data: AppendMatchEventDto,
): Promise<{ event: MatchEventRecord; state: MatchState }> {
  const response = await api.post(`/live-matches/${id}/events`, data);

  return response.data.data;
}

export async function readyLiveMatch(
  id: string,
): Promise<{ event: MatchEventRecord; state: MatchState }> {
  const response = await api.post(`/live-matches/${id}/ready`);

  return response.data.data;
}

export async function undoLiveMatchEvent(
  id: string,
  data: UndoLiveMatchDto,
): Promise<{ event: MatchEventRecord; state: MatchState }> {
  const response = await api.post(`/live-matches/${id}/undo`, data);

  return response.data.data;
}

export async function lockLiveMatch(
  id: string,
  reason?: string,
): Promise<{ event: MatchEventRecord; state: MatchState }> {
  const response = await api.post(
    `/live-matches/${id}/lock`,
    reason ? { reason } : {},
  );

  return response.data.data;
}

export async function reopenLiveMatch(
  id: string,
  reason?: string,
): Promise<{ event: MatchEventRecord; state: MatchState }> {
  const response = await api.post(
    `/live-matches/${id}/reopen`,
    reason ? { reason } : {},
  );

  return response.data.data;
}

export async function startZoneOcr(
  id: string,
  data: StartZoneOcrDto,
): Promise<ZoneOcrStatus> {
  const response = await api.post(`/live-matches/${id}/ocr/start`, data);

  return response.data.data;
}

export async function stopZoneOcr(id: string): Promise<ZoneOcrStatus> {
  const response = await api.post(`/live-matches/${id}/ocr/stop`);

  return response.data.data;
}

export async function getZoneOcrStatus(id: string): Promise<ZoneOcrStatus> {
  const response = await api.get(`/live-matches/${id}/ocr/status`);

  return response.data.data;
}