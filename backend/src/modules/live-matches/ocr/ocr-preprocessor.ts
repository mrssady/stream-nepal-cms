import {
  type OcrResolution,
  type OcrRoiConfig,
  REFERENCE_RESOLUTION,
  scaleRois,
  type OcrProfileConfig,
} from './ocr-config';

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PreprocessPipeline {
  scale: number;
  grayscale: boolean;
  contrast: number;
  threshold: number;
  denoise: boolean;
}

export interface PreparedRoi {
  key: string;
  crop: CropBox;
  pipeline: PreprocessPipeline;
  enabled: boolean;
  ocr: boolean;
  label: string;
}

function normalizePreprocess(roi: OcrRoiConfig): PreprocessPipeline {
  const pre = roi.preprocessing ?? {};

  const scale = clampNumber(pre.scale, 1, 5, 2);
  const contrast = clampNumber(pre.contrast, 1, 5, 1.5);
  const threshold = clampNumber(pre.threshold, 0, 255, 120);

  return {
    scale,
    grayscale: typeof pre.grayscale === 'boolean' ? pre.grayscale : true,
    contrast,
    threshold,
    denoise: typeof pre.denoise === 'boolean' ? pre.denoise : false,
  };
}

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

function clampCrop(crop: CropBox, frame: OcrResolution): CropBox {
  return {
    x: Math.max(0, Math.min(crop.x, frame.width - 1)),
    y: Math.max(0, Math.min(crop.y, frame.height - 1)),
    width: Math.min(crop.width, frame.width - crop.x),
    height: Math.min(crop.height, frame.height - crop.y),
  };
}

// Resolve the concrete capture region + preprocessing for a ROI.
// Coordinates are scaled from the profile reference resolution to the
// actual frame size (spec: scaleX = width/1920, scaleY = height/1080).
export function prepareRois(
  config: OcrProfileConfig,
  frame: OcrResolution,
): PreparedRoi[] {
  const scaled = scaleRois(config, frame);

  return Object.entries(config.rois).map(([key, roi]) => {
    const scaledRoi = scaled[key];

    return {
      key,
      crop: clampCrop(
        {
          x: scaledRoi.x,
          y: scaledRoi.y,
          width: scaledRoi.width,
          height: scaledRoi.height,
        },
        frame,
      ),
      pipeline: normalizePreprocess(roi),
      enabled: roi.enabled,
      ocr: roi.enabled && roi.ocr,
      label: roi.label,
    };
  });
}

export function referenceResolution(): OcrResolution {
  return { ...REFERENCE_RESOLUTION };
}
