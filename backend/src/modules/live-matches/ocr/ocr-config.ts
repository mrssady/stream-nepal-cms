// ============================================================
// OCR PROFILE CONFIG MODEL
// ============================================================
// Follows the STREAM NEPAL PUBG Mobile spectator OCR layout spec.
// Reference resolution is 1920x1080; all ROIs are defined in that
// coordinate space and scaled to the source resolution at runtime.

export interface OcrResolution {
  width: number;
  height: number;
}

export interface OcrRoiConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  enabled: boolean;
  ocr: boolean;
  label: string;
  purpose: string;
  preprocessing: Record<string, unknown>;
}

export type OcrRoiMap = Record<string, OcrRoiConfig>;

export interface OcrProfileConfig {
  resolution: OcrResolution;
  rois: OcrRoiMap;
  preprocessing: Record<string, unknown>;
}

export const REFERENCE_RESOLUTION: OcrResolution = {
  width: 1920,
  height: 1080,
};

// ------------------------------------------------------------
// Built-in ROI template for the PUBG Mobile 1920x1080 HUD
// (REQUIRED layout from the spec; every field is editable)
// ------------------------------------------------------------

const defaultPreprocessing = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  scale: 2,
  grayscale: true,
  contrast: 1.5,
  threshold: 120,
  denoise: false,
  ...overrides,
});

export const INITIAL_ROIS: OcrRoiMap = {
  matchHeader: {
    x: 0,
    y: 0,
    width: 300,
    height: 65,
    enabled: true,
    ocr: true,
    label: 'Match header',
    purpose: 'Remaining players + observed team count',
    preprocessing: defaultPreprocessing(),
  },
  teamEliminations: {
    x: 0,
    y: 45,
    width: 250,
    height: 35,
    enabled: true,
    ocr: true,
    label: 'Team eliminations',
    purpose: 'Informational elimination counter (not primary placement source)',
    preprocessing: defaultPreprocessing(),
  },
  observerPlayerList: {
    x: 0,
    y: 75,
    width: 260,
    height: 180,
    enabled: true,
    ocr: true,
    label: 'Observer player list',
    purpose: 'Currently observed team/player markers',
    preprocessing: defaultPreprocessing({ threshold: 140 }),
  },
  killFeed: {
    x: 0,
    y: 250,
    width: 500,
    height: 300,
    enabled: false,
    ocr: true,
    label: 'Kill feed',
    purpose:
      'Kill/elimination events - disabled until confirmed on real footage',
    preprocessing: defaultPreprocessing(),
  },
  minimap: {
    x: 1740,
    y: 0,
    width: 180,
    height: 180,
    enabled: false,
    ocr: false,
    label: 'Minimap',
    purpose: 'Computer vision (markers / zone). Ignored for OCR MVP.',
    preprocessing: defaultPreprocessing({ scale: 1 }),
  },
  zoneInfo: {
    x: 1730,
    y: 145,
    width: 190,
    height: 90,
    enabled: true,
    ocr: true,
    label: 'Zone / stage information',
    purpose: 'Zone timer + stage number (optional match state)',
    preprocessing: defaultPreprocessing({ scale: 3, contrast: 1.6 }),
  },
  currentTeam: {
    x: 580,
    y: 735,
    width: 380,
    height: 100,
    enabled: true,
    ocr: true,
    label: 'Current observed team',
    purpose:
      'Observer "Teams N" counter + current team tag (observerTeamsValue)',
    preprocessing: defaultPreprocessing(),
  },
  playerStats: {
    x: 950,
    y: 760,
    width: 300,
    height: 150,
    enabled: true,
    ocr: true,
    label: 'Player statistics',
    purpose: 'Eliminations / damage / assists of observed player',
    preprocessing: defaultPreprocessing({ threshold: 120 }),
  },
};

// ------------------------------------------------------------
// Validation + normalization
// ------------------------------------------------------------

function toSafeInt(value: unknown, fallback: number, min: number): number {
  const number = Math.round(Number(value));

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(min, number);
}

function toBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  return fallback;
}

function normalizeRoi(
  key: string,
  input: unknown,
  template: OcrRoiConfig,
): OcrRoiConfig {
  const partial =
    input && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {};

  const x = toSafeInt(partial.x, template.x, 0);
  const y = toSafeInt(partial.y, template.y, 0);
  const width = toSafeInt(partial.width, template.width, 1);
  const height = toSafeInt(partial.height, template.height, 1);

  return {
    x,
    y,
    width,
    height,
    enabled: toBool(partial.enabled, template.enabled),
    ocr: toBool(partial.ocr, template.ocr),
    label: typeof partial.label === 'string' ? partial.label : template.label,
    purpose:
      typeof partial.purpose === 'string' ? partial.purpose : template.purpose,
    preprocessing:
      partial.preprocessing &&
      typeof partial.preprocessing === 'object' &&
      !Array.isArray(partial.preprocessing)
        ? {
            ...template.preprocessing,
            ...(partial.preprocessing as Record<string, unknown>),
          }
        : template.preprocessing,
  };
}

export function normalizeOcrConfig(
  input: unknown,
  fallbackResolution: OcrResolution,
): OcrProfileConfig {
  const source =
    input && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {};

  const resolutionSource =
    source.resolution &&
    typeof source.resolution === 'object' &&
    !Array.isArray(source.resolution)
      ? (source.resolution as Record<string, unknown>)
      : {};
  const resolution: OcrResolution = {
    width: toSafeInt(resolutionSource.width, fallbackResolution.width, 1),
    height: toSafeInt(resolutionSource.height, fallbackResolution.height, 1),
  };

  const roisSource =
    source.rois &&
    typeof source.rois === 'object' &&
    !Array.isArray(source.rois)
      ? (source.rois as Record<string, unknown>)
      : {};

  const rois: OcrRoiMap = {};
  const keys = new Set([
    ...Object.keys(INITIAL_ROIS),
    ...Object.keys(roisSource),
  ]);

  for (const key of keys) {
    const template = INITIAL_ROIS[key];

    if (template) {
      rois[key] = normalizeRoi(key, roisSource[key], template);
    } else if (roisSource[key]) {
      rois[key] = normalizeRoi(key, roisSource[key], {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        enabled: true,
        ocr: true,
        label: key,
        purpose: '',
        preprocessing: defaultPreprocessing(),
      });
    }
  }

  return {
    resolution,
    rois,
    preprocessing:
      source.preprocessing &&
      typeof source.preprocessing === 'object' &&
      !Array.isArray(source.preprocessing)
        ? (source.preprocessing as Record<string, unknown>)
        : {},
  };
}

// ------------------------------------------------------------
// Resolution scaling (spec: scaleX = width/1920, scaleY = height/1080)
// ------------------------------------------------------------

export function scaleRois(
  config: OcrProfileConfig,
  target: OcrResolution,
): OcrRoiMap {
  const scaleX = target.width / REFERENCE_RESOLUTION.width;
  const scaleY = target.height / REFERENCE_RESOLUTION.height;

  const scaled: OcrRoiMap = {};

  for (const [key, roi] of Object.entries(config.rois)) {
    scaled[key] = {
      ...roi,
      x: Math.round(roi.x * scaleX),
      y: Math.round(roi.y * scaleY),
      width: Math.max(1, Math.round(roi.width * scaleX)),
      height: Math.max(1, Math.round(roi.height * scaleY)),
    };
  }

  return scaled;
}
