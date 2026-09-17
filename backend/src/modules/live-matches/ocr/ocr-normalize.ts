// Text + value normalization before OCR matching (spec: DR5 -> DRS).

const CHAR_MAP: Record<string, string> = {
  '0': 'O',
  '1': 'I',
  '5': 'S',
  '8': 'B',
  '@': 'A',
  $: 'S',
  '#': 'I',
};

export function normalizeText(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((character) => CHAR_MAP[character] ?? character)
    .join('')
    .replace(/[^A-Z0-9]/g, '');
}

export function extractIntegers(text: string): number[] {
  const matches = text.match(/\d+/g);

  if (!matches) {
    return [];
  }

  return matches.map((value) => Number(value));
}

export function firstInteger(text: string, fallback?: number): number | null {
  const values = extractIntegers(text);

  if (values.length === 0) {
    return fallback ?? null;
  }

  return values[0];
}

export function parseDurationSeconds(text: string): number | null {
  const match = text.match(/(\d{1,2}):(\d{2})(?!\d)/);

  if (!match) {
    return null;
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);

  if (seconds > 59) {
    return null;
  }

  return minutes * 60 + seconds;
}

export function valueToken(value: Record<string, unknown>): string {
  const sorted: Record<string, unknown> = {};

  for (const key of Object.keys(value).sort()) {
    sorted[key] = value[key];
  }

  return JSON.stringify(sorted);
}
