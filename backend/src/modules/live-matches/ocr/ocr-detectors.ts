import { confidenceTier } from './ocr-confidence';
import {
  extractIntegers,
  firstInteger,
  normalizeText,
  parseDurationSeconds,
} from './ocr-normalize';
import { matchTeamTag } from './ocr-fuzzy';
import {
  type DetectionKind,
  type OcrDetection,
  type RoiReading,
} from './ocr-types';

export interface DetectContext {
  knownTeamTags?: string[];
}

// A detection carries the reading confidence when its structure parses
// cleanly; partial or unconvincing parses are down-weighted. Unparseable
// ROIs yield no detection (the engine simply skips them).

function makeDetection(
  reading: RoiReading,
  kind: DetectionKind,
  value: Record<string, unknown>,
  confidence: number,
): OcrDetection {
  return {
    roiKey: reading.roiKey,
    kind,
    value,
    confidence,
    tier: confidenceTier(confidence),
    rawText: reading.text,
    timestamp: reading.timestamp,
  };
}

function detectMatchHeader(reading: RoiReading): OcrDetection | null {
  const lower = reading.text.toLowerCase();
  const remainingMatch = lower.match(/remaining\D*(\d+)/);
  const teamMatch = lower.match(/team\D*(\d+)/);

  if (!remainingMatch && !teamMatch) {
    return null;
  }

  const remainingPlayers = remainingMatch ? Number(remainingMatch[1]) : null;
  const observedTeamCount = teamMatch ? Number(teamMatch[1]) : null;

  const found =
    (remainingPlayers !== null ? 1 : 0) + (observedTeamCount !== null ? 1 : 0);

  return makeDetection(
    reading,
    'MATCH_HEADER',
    {
      remainingPlayers,
      observedTeamCount,
    },
    reading.confidence * (found === 2 ? 1 : 0.8),
  );
}

function detectTeamEliminations(reading: RoiReading): OcrDetection | null {
  const match = reading.text.toLowerCase().match(/eliminations?\D*(\d+)/);

  if (!match) {
    return null;
  }

  return makeDetection(
    reading,
    'TEAM_ELIMINATIONS',
    {
      teamEliminations: Number(match[1]),
    },
    reading.confidence,
  );
}

function detectObserverPlayerList(
  reading: RoiReading,
  context: DetectContext,
): OcrDetection | null {
  const lines = reading.text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return null;
  }

  const recognized = lines.map((line) => {
    const normalized = normalizeText(line);

    if (!context.knownTeamTags || context.knownTeamTags.length === 0) {
      return {
        raw: line,
        teamTag: null,
      };
    }

    const result = matchTeamTag(normalized, context.knownTeamTags);

    if (result.match) {
      return {
        raw: line,
        teamTag: result.match.tag,
      };
    }

    return {
      raw: line,
      teamTag: null,
    };
  });

  return makeDetection(
    reading,
    'OBSERVER_PLAYER_LIST',
    {
      lines: recognized,
    },
    reading.confidence * 0.9,
  );
}

function detectZoneInfo(reading: RoiReading): OcrDetection | null {
  const duration = parseDurationSeconds(reading.text);
  const stageMatch = reading.text.toLowerCase().match(/stage\D*(\d+)/);

  // A zone reading must carry a recognizable countdown timer, otherwise
  // the ROI is probably showing something else on this frame.
  if (duration === null && !stageMatch) {
    return null;
  }

  const value: Record<string, unknown> = {};

  if (duration !== null) {
    value.zoneTimerSeconds = duration;
  }

  if (stageMatch) {
    value.stage = Number(stageMatch[1]);
  }

  return makeDetection(
    reading,
    'ZONE_INFO',
    value,
    reading.confidence * (duration !== null && stageMatch ? 1 : 0.85),
  );
}

function detectCurrentTeam(
  reading: RoiReading,
  context: DetectContext,
): OcrDetection | null {
  const lower = reading.text.toLowerCase();
  const teamsMatch = lower.match(/teams?\D*(\d+)/);

  const lines = reading.text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const tagLine = lines.find((line) => !/teams?\s*\d+/i.test(line));

  if (!teamsMatch && !tagLine) {
    return null;
  }

  const value: Record<string, unknown> = {};

  if (teamsMatch) {
    value.observerTeamsValue = Number(teamsMatch[1]);
  }

  if (tagLine) {
    value.currentTeamTagRaw = tagLine;

    if (context.knownTeamTags && context.knownTeamTags.length > 0) {
      const result = matchTeamTag(tagLine, context.knownTeamTags);

      if (result.match) {
        value.currentTeamTag = result.match.tag;
        value.currentTeamScore = round2(result.match.score);
      } else if (result.ambiguous) {
        value.currentTeamAmbiguous = result.ambiguous.map((entry) => entry.tag);
      }
    }
  }

  const found = (teamsMatch ? 1 : 0) + (tagLine ? 1 : 0);

  return makeDetection(
    reading,
    'CURRENT_TEAM',
    value,
    reading.confidence * (found === 2 ? 1 : 0.8),
  );
}

function detectPlayerStats(reading: RoiReading): OcrDetection | null {
  const lower = reading.text.toLowerCase();

  const eliminationMatch = lower.match(/eliminations?\D*(\d+)/);
  const damageMatch = lower.match(/damage\D*(\d+)/);
  const assistsMatch = lower.match(/assists?\D*(\d+)/);

  if (!eliminationMatch && !damageMatch && !assistsMatch) {
    return null;
  }

  const value: Record<string, unknown> = {};

  if (eliminationMatch) {
    value.eliminations = Number(eliminationMatch[1]);
  }

  if (damageMatch) {
    value.damage = Number(damageMatch[1]);
  }

  if (assistsMatch) {
    value.assists = Number(assistsMatch[1]);
  }

  const found =
    (eliminationMatch ? 1 : 0) + (damageMatch ? 1 : 0) + (assistsMatch ? 1 : 0);

  return makeDetection(
    reading,
    'PLAYER_STATS',
    value,
    reading.confidence * (found === 3 ? 1 : 0.8),
  );
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function detectReading(
  reading: RoiReading,
  context: DetectContext = {},
): OcrDetection | null {
  switch (reading.roiKey) {
    case 'matchHeader':
      return detectMatchHeader(reading);
    case 'teamEliminations':
      return detectTeamEliminations(reading);
    case 'observerPlayerList':
      return detectObserverPlayerList(reading, context);
    case 'zoneInfo':
      return detectZoneInfo(reading);
    case 'currentTeam':
      return detectCurrentTeam(reading, context);
    case 'playerStats':
      return detectPlayerStats(reading);
    case 'minimap':
      // Computer vision only - never OCR.
      return null;
    default:
      // Unknown / disabled ROIs produce no structured detection.
      return null;
  }
}

export { extractIntegers, firstInteger, normalizeText };
