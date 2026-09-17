import { prepareRois } from './ocr-preprocessor';
import { normalizeOcrConfig, type OcrProfileConfig } from './ocr-config';

function configFor(): OcrProfileConfig {
  return normalizeOcrConfig({}, { width: 1920, height: 1080 });
}

describe('prepareRois', () => {
  it('scales ROIs from reference to target frame size', () => {
    const config = configFor();
    const scaled = prepareRois(config, { width: 1280, height: 720 });

    const matchHeader = scaled.find((roi) => roi.key === 'matchHeader');
    const zoneInfo = scaled.find((roi) => roi.key === 'zoneInfo');

    // Reference matchHeader = 0,0,300,65 -> 1280/1920=0.666, 720/1080=0.666.
    expect(matchHeader?.crop).toEqual({ x: 0, y: 0, width: 200, height: 43 });
    // Reference zoneInfo = 1730,145,190,90.
    expect(zoneInfo?.crop).toEqual({ x: 1153, y: 97, width: 127, height: 60 });
  });

  it('clamps crops to frame bounds', () => {
    const config = configFor();
    const scaled = prepareRois(config, { width: 640, height: 360 });

    for (const roi of scaled) {
      expect(roi.crop.x + roi.crop.width).toBeLessThanOrEqual(640);
      expect(roi.crop.y + roi.crop.height).toBeLessThanOrEqual(360);
      expect(roi.crop.width).toBeGreaterThan(0);
      expect(roi.crop.height).toBeGreaterThan(0);
    }
  });

  it('builds a normalized preprocessing pipeline per ROI', () => {
    const config = configFor();
    const rois = prepareRois(config, { width: 1920, height: 1080 });

    const playerStats = rois.find((roi) => roi.key === 'playerStats');
    expect(playerStats?.pipeline.grayscale).toBe(true);
    expect(playerStats?.pipeline.scale).toBeGreaterThan(0);
    expect(playerStats?.pipeline.contrast).toBeGreaterThan(0);
    expect(playerStats?.pipeline.threshold).toBeGreaterThanOrEqual(0);
    expect(playerStats?.pipeline.denoise).toBe(false);

    // Kill feed is disabled until validated on real footage.
    const killFeed = rois.find((roi) => roi.key === 'killFeed');
    expect(killFeed?.enabled).toBe(false);
    expect(killFeed?.ocr).toBe(false);
  });
});
