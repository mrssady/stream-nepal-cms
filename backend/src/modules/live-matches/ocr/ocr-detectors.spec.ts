import { detectReading } from './ocr-detectors';
import { type RoiReading } from './ocr-types';

const TEAM_TAGS = ['777A', 'DRS', 'NIN', 'R2K'];

function reading(roiKey: string, text: string, confidence = 0.95): RoiReading {
  return {
    roiKey,
    text,
    confidence,
    timestamp: 1,
    provider: 'mock',
  };
}

describe('detectReading', () => {
  it('parses match header remaining/team counts', () => {
    const detection = detectReading(
      reading('matchHeader', 'Remaining 75 Team 21'),
    );

    expect(detection?.kind).toBe('MATCH_HEADER');
    expect(detection?.value).toEqual({
      remainingPlayers: 75,
      observedTeamCount: 21,
    });
  });

  it('parses team eliminations', () => {
    const detection = detectReading(
      reading('teamEliminations', 'Team Eliminations 2'),
    );

    expect(detection?.value).toEqual({ teamEliminations: 2 });
  });

  it('parses zone timer and stage', () => {
    const detection = detectReading(reading('zoneInfo', '03:49 Stage 1'));

    expect(detection?.kind).toBe('ZONE_INFO');
    expect(detection?.value).toEqual({
      zoneTimerSeconds: 229,
      stage: 1,
    });
  });

  it('parses current team and resolves against known teams', () => {
    const detection = detectReading(reading('currentTeam', 'Teams 5\nDR$'), {
      knownTeamTags: TEAM_TAGS,
    });

    expect(detection?.kind).toBe('CURRENT_TEAM');
    expect(detection?.value.observerTeamsValue).toBe(5);
    expect(detection?.value.currentTeamTag).toBe('DRS');
  });

  it('parses player stats', () => {
    const detection = detectReading(
      reading('playerStats', 'Eliminations 0 Damage 325 Assists 1'),
    );

    expect(detection?.value).toEqual({
      eliminations: 0,
      damage: 325,
      assists: 1,
    });
  });

  it('parses observer player list and matches lines to teams', () => {
    const detection = detectReading(
      reading('observerPlayerList', '777A\nNIN\nDESERT'),
      { knownTeamTags: TEAM_TAGS },
    );

    const lines = detection?.value.lines as Array<{
      raw: string;
      teamTag: string | null;
    }>;

    expect(lines[0].teamTag).toBe('777A');
    expect(lines[1].teamTag).toBe('NIN');
    expect(lines[2].teamTag).toBeNull();
  });

  it('ignores the minimap ROI (CV-only)', () => {
    expect(detectReading(reading('minimap', 'anything'))).toBeNull();
  });

  it('returns null for unknown ROI keys', () => {
    expect(detectReading(reading('unknown', 'x'))).toBeNull();
  });

  it('down-weights partial parses', () => {
    const full = detectReading(reading('matchHeader', 'Remaining 75 Team 21'));
    const partial = detectReading(reading('matchHeader', 'Remaining 75'));

    expect(partial?.confidence).toBeLessThan(full?.confidence ?? 1);
  });
});
