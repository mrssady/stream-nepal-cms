import {
  normalizeText,
  parseDurationSeconds,
  firstInteger,
} from './ocr-normalize';

describe('normalizeText', () => {
  it('uppercases and strips non-alphanumerics', () => {
    expect(normalizeText(' Drs. ')).toBe('DRS');
  });

  it('maps OCR character confusions', () => {
    expect(normalizeText('DR5')).toBe('DRS');
    expect(normalizeText('DR0')).toBe('DRO');
    expect(normalizeText('N1N')).toBe('NIN');
    expect(normalizeText('77BB')).toBe('77BB');
  });

  it('handles empty and junk input', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText('___')).toBe('');
  });
});

describe('parseDurationSeconds', () => {
  it('parses mm:ss', () => {
    expect(parseDurationSeconds('03:49')).toBe(229);
    expect(parseDurationSeconds('3:49')).toBe(229);
  });

  it('rejects invalid durations', () => {
    expect(parseDurationSeconds('abc')).toBe(null);
    expect(parseDurationSeconds('03:99')).toBe(null);
  });
});

describe('firstInteger', () => {
  it('extracts the first integer from text', () => {
    expect(firstInteger('Remaining 75 Team 21')).toBe(75);
    expect(firstInteger('nothing')).toBeNull();
    expect(firstInteger('nothing', 3)).toBe(3);
  });
});
