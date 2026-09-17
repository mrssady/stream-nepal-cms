import { buildMonitorScene } from './ocr-monitor-scene';

const TEAMS = ['777A', 'DRS', 'NIN', 'R2K', 'TITAN'];

describe('buildMonitorScene', () => {
  it('starts with a populated match state', () => {
    const scene = buildMonitorScene(0, TEAMS);

    expect(scene.remainingPlayers).toBe(75);
    expect(scene.zoneTimerSeconds).toBe(229);
    expect(scene.currentTeamTag).toBe('777A');
    expect(scene.observedTeamCount).toBe(21);
  });

  it('advances value steps every 6 ticks', () => {
    const b = buildMonitorScene(6, TEAMS);

    expect(b.teamEliminations).toBe(1);
    expect(b.remainingPlayers).toBe(74);
    expect(b.zoneTimerSeconds).toBe(224);
    expect(b.playerEliminations).toBe(1);
  });

  it('keeps values in a safe range over time', () => {
    for (let tick = 0; tick < 500; tick++) {
      const scene = buildMonitorScene(tick, TEAMS);

      expect(scene.remainingPlayers).toBeGreaterThanOrEqual(10);
      expect(scene.zoneTimerSeconds).toBeGreaterThanOrEqual(1);
      expect(scene.playerDamage).toBeGreaterThan(0);
      expect(scene.teamEliminations).toBeGreaterThanOrEqual(0);
      expect(scene.playerAssists).toBeLessThanOrEqual(9);
    }
  });

  it('falls back to a default tag when the roster is empty', () => {
    const scene = buildMonitorScene(0, []);
    expect(scene.currentTeamTag).toBe('777A');
  });

  it('rotates the observed team through the roster', () => {
    const one = buildMonitorScene(0, TEAMS).currentTeamTag;
    const two = buildMonitorScene(24, TEAMS).currentTeamTag;

    expect(TEAMS).toContain(one);

    // 24/6 = 4 -> indexes (0,4) are distinct teams.
    expect(one).not.toBe(two);
  });
});
