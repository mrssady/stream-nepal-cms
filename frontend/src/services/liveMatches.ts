import api from "./api";

import {
  type AppendMatchEventDto,
  type CreateLiveMatchDto,
  type LiveMatch,
  type MatchEventRecord,
  type MatchState,
  type OcrApproveResult,
  type OcrMonitorLatest,
  type OcrMonitorStatus,
  type OcrOverlayPayload,
  type OcrRejectResult,
  type OcrReviewPayload,
  type SnapshotPayload,
  type StartOcrMonitorDto,
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

export async function startOcrMonitor(
  id: string,
  data: StartOcrMonitorDto,
): Promise<OcrMonitorStatus> {
  const response = await api.post(
    `/live-matches/${id}/ocr/monitor/start`,
    data,
  );

  return response.data.data;
}

export async function stopOcrMonitor(
  id: string,
): Promise<OcrMonitorStatus> {
  const response = await api.post(`/live-matches/${id}/ocr/monitor/stop`);

  return response.data.data;
}

export async function getOcrMonitorStatus(
  id: string,
): Promise<OcrMonitorStatus> {
  const response = await api.get(`/live-matches/${id}/ocr/monitor/status`);

  return response.data.data;
}

export async function getOcrMonitorLatest(
  id: string,
): Promise<OcrMonitorLatest> {
  const response = await api.get(`/live-matches/${id}/ocr/monitor/latest`);

  return response.data.data;
}

export async function getOcrReview(id: string): Promise<OcrReviewPayload> {
  const response = await api.get(`/live-matches/${id}/ocr/review`);

  return response.data.data;
}

export async function approveOcrCandidate(
  id: string,
  candidateId: string,
): Promise<OcrApproveResult> {
  const response = await api.post(
    `/live-matches/${id}/ocr/review/${candidateId}/approve`,
  );

  return response.data.data;
}

export async function rejectOcrCandidate(
  id: string,
  candidateId: string,
): Promise<OcrRejectResult> {
  const response = await api.post(
    `/live-matches/${id}/ocr/review/${candidateId}/reject`,
  );

  return response.data.data;
}

export async function getOcrOverlay(
  id: string,
  width?: number,
  height?: number,
): Promise<OcrOverlayPayload> {
  const response = await api.get(`/live-matches/${id}/ocr/overlay`, {
    params: {
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
    },
  });

  return response.data.data;
}