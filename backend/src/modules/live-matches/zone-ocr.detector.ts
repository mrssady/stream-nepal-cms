import { ZoneOcrMode } from './dto/start-zone-ocr.dto';

export interface ZoneTimerReading {
  seconds: number | null;
  confidence: number;
  raw?: string;
}

export interface ZoneTimerDetector {
  readonly mode: ZoneOcrMode;
  read(tick: number): Promise<ZoneTimerReading>;
  close(): void;
}

export interface MockDetectorOptions {
  initialSeconds: number;
  stepSeconds: number;
  noise: boolean;
}

const MOCK_DURATIONS = [180, 150, 120, 90, 60, 45, 30, 20, 15];

export class MockZoneDetector implements ZoneTimerDetector {
  readonly mode = ZoneOcrMode.MOCK;

  private zoneIndex = 0;
  private remaining: number;

  constructor(private readonly options: MockDetectorOptions) {
    this.remaining = options.initialSeconds;
  }

  read(): Promise<ZoneTimerReading> {
    const noise = this.options.noise;

    if (noise && Math.random() < 0.06) {
      return Promise.resolve({ seconds: null, confidence: 0.2, raw: '---' });
    }

    let seconds = this.remaining;
    let confidence = 0.92;

    if (noise && Math.random() < 0.12) {
      seconds = Math.max(0, seconds + (Math.random() < 0.5 ? -1 : 1));
      confidence = 0.55;
    }

    this.remaining -= this.options.stepSeconds;

    if (this.remaining <= 0) {
      this.zoneIndex = (this.zoneIndex + 1) % MOCK_DURATIONS.length;
      this.remaining = MOCK_DURATIONS[this.zoneIndex];
    }

    return Promise.resolve({
      seconds,
      confidence,
      raw: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
    });
  }

  close(): void {
    this.remaining = 0;
  }
}
