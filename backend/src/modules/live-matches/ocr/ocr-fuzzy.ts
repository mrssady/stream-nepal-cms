import { normalizeText } from './ocr-normalize';

export interface TeamMatch {
  tag: string;
  score: number;
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) {
    return n;
  }

  if (n === 0) {
    return m;
  }

  const previous = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    const current = [i];

    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[n];
}

export function similarity(a: string, b: string): number {
  if (a === b) {
    return 1;
  }

  const maxLength = Math.max(a.length, b.length);

  if (maxLength === 0) {
    return 1;
  }

  return 1 - levenshtein(a, b) / maxLength;
}

export interface TeamMatchResult {
  match?: TeamMatch;
  ambiguous?: TeamMatch[];
}

export function matchTeamTag(
  raw: string,
  knownTags: string[],
  options: { minScore?: number; ambiguityGap?: number } = {},
): TeamMatchResult {
  const minScore = options.minScore ?? 0.8;
  const ambiguityGap = options.ambiguityGap ?? 0.2;

  const candidate = normalizeText(raw);

  if (candidate.length === 0) {
    return {};
  }

  const scored = knownTags
    .filter((tag) => tag.length > 0)
    .map((tag) => ({
      tag,
      score: similarity(candidate, normalizeText(tag)),
    }))
    .sort((left, right) => right.score - left.score);

  if (scored.length === 0 || scored[0].score < minScore) {
    return {};
  }

  const best = scored[0];

  const close = scored.filter(
    (entry) => entry.score > best.score - ambiguityGap && entry !== best,
  );

  if (close.length > 0) {
    return {
      ambiguous: [best, ...close].slice(0, 3),
    };
  }

  return {
    match: { tag: best.tag, score: best.score },
  };
}
