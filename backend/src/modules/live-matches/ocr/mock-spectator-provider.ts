import { type OcrFrame, type OcrProvider, type RoiReading } from './ocr-types';

export interface MockScene {
  remainingPlayers?: number;
  observedTeamCount?: number;
  teamEliminations?: number;
  zoneTimerSeconds?: number;
  zoneStage?: number;
  observerTeamsValue?: number;
  currentTeamTag?: string;
  playerEliminations?: number;
  playerDamage?: number;
  playerAssists?: number;
  playerTags?: string[];
  noise?: boolean;
}

// Deterministic PRNG so dry-run demos and tests are repeatable.
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function jitter(value: number, random: () => number, span: number): number {
  return value + (random() * 2 - 1) * span;
}

const CHARACTER_SUBSTITUTIONS: Array<[string, string]> = [
  ['A', '4'],
  ['S', '5'],
  ['O', '0'],
  ['I', '1'],
];

function ocrCorrupt(text: string, random: () => number): string {
  const characters = text.split('');

  for (let i = 0; i < characters.length; i++) {
    if (random() > 0.85) {
      for (const [letter, digit] of CHARACTER_SUBSTITUTIONS) {
        if (characters[i] === letter && random() > 0.5) {
          characters[i] = digit;
          break;
        }
      }
    }
  }

  return characters.join('');
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export interface MockSpectatorProviderOptions {
  seed?: number;
  noiseProbability?: number;
  confidenceBase?: number;
  readonly?: boolean;
}

// Simulates the semantic content of a spectator feed frame. It exists to
// exercise the analysis core end-to-end before real footage is available.
export class MockSpectatorProvider implements OcrProvider {
  readonly id = 'mock-spectator';
  readonly label = 'Mock spectator feed';

  private readonly random: () => number;
  private readonly noiseProbability: number;
  private readonly confidenceBase: number;
  private readonly startTime = Date.now();
  private frameIndex = 0;

  constructor(options: MockSpectatorProviderOptions = {}) {
    this.random = mulberry32(options.seed ?? 1337);
    this.noiseProbability = options.noiseProbability ?? 0.1;
    this.confidenceBase = options.confidenceBase ?? 0.96;
  }

  readFrame(
    config: { rois: Record<string, { enabled: boolean; ocr: boolean }> },
    frame: OcrFrame,
    context: { teamTags?: string[] } = {},
  ): Promise<RoiReading[]> {
    return Promise.resolve(this.buildFrame(config, frame, context));
  }

  private buildFrame(
    config: { rois: Record<string, { enabled: boolean; ocr: boolean }> },
    frame: OcrFrame,
    context: { teamTags?: string[] },
  ): RoiReading[] {
    this.frameIndex += 1;

    const scene: MockScene =
      typeof frame.data === 'object' ? ((frame.data as MockScene) ?? {}) : {};

    const shouldNoise =
      scene.noise === true || this.random() < this.noiseProbability;

    const readings: RoiReading[] = [];
    const push = (roiKey: string, text: string): void => {
      const roi = config.rois[roiKey];

      if (!roi || !roi.enabled || !roi.ocr) {
        return;
      }

      const confidence = clampConfidence(
        jitter(this.confidenceBase, this.random, 0.04),
      );

      readings.push({
        roiKey,
        text:
          shouldNoise && this.random() > 0.5
            ? ocrCorrupt(text, this.random)
            : text,
        confidence,
        timestamp: this.startTime + this.frameIndex * 1000 + readings.length,
        provider: this.id,
      });
    };

    if (
      scene.remainingPlayers !== undefined ||
      scene.observedTeamCount !== undefined
    ) {
      push(
        'matchHeader',
        `Remaining ${scene.remainingPlayers ?? 75} Team ${scene.observedTeamCount ?? 21}`,
      );
    }

    if (scene.teamEliminations !== undefined) {
      push('teamEliminations', `Team Eliminations ${scene.teamEliminations}`);
    }

    const playerTags = scene.playerTags ??
      context.teamTags ?? ['777A', 'DRS', 'NIN'];

    if (playerTags.length > 0) {
      push('observerPlayerList', playerTags.join('\n'));
    }

    if (scene.zoneTimerSeconds !== undefined || scene.zoneStage !== undefined) {
      push(
        'zoneInfo',
        `${
          scene.zoneTimerSeconds !== undefined
            ? formatDuration(scene.zoneTimerSeconds)
            : '03:49'
        } ${scene.zoneStage !== undefined ? `Stage ${scene.zoneStage}` : ''}`.trim(),
      );
    }

    const currentTeamTag = scene.currentTeamTag ?? '777A';

    push(
      'currentTeam',
      `Teams ${scene.observerTeamsValue ?? 5}\n${currentTeamTag}`,
    );

    const eliminations = scene.playerEliminations ?? 0;
    const damage = scene.playerDamage ?? 325;
    const assists = scene.playerAssists ?? 1;

    push(
      'playerStats',
      `Eliminations ${eliminations} Damage ${damage} Assists ${assists}`,
    );

    return readings;
  }
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}
