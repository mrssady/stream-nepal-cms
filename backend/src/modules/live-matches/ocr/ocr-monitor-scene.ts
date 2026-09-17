import { type MockScene } from './mock-spectator-provider';

// Pure scene progression for the dry-run monitor. Values mutate in discrete
// steps (every 6 ticks) so the temporal validator can re-confirm stable
// values while the panel still shows live updates (zone countdown, elims,
// observed team rotation).
export function buildMonitorScene(tick: number, teamTags: string[]): MockScene {
  const fallbackTags = teamTags.length > 0 ? teamTags : ['777A'];
  const six = Math.floor(tick / 6);
  const cycle = six % 24;

  return {
    remainingPlayers: Math.max(10, 75 - cycle),
    observedTeamCount: Math.max(5, 21 - Math.floor(cycle / 4)),
    teamEliminations: cycle % 7,
    zoneTimerSeconds: Math.max(1, 229 - cycle * 5),
    zoneStage: 1 + Math.floor(tick / 40),
    observerTeamsValue: 5,
    currentTeamTag: fallbackTags[cycle % fallbackTags.length],
    playerEliminations: cycle % 9,
    playerDamage: 325 + ((cycle * 11) % 700),
    playerAssists: Math.min(9, cycle),
    playerTags: fallbackTags.slice(0, 6),
    noise: false,
  };
}
