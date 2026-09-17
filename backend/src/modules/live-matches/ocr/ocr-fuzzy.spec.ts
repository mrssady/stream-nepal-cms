import { matchTeamTag, similarity, levenshtein } from './ocr-fuzzy';

const TEAMS = ['777A', 'DRS', 'NIN', 'TITAN', 'R2K'];

describe('levenshtein / similarity', () => {
  it('scores exact matches at 1', () => {
    expect(similarity('DRS', 'DRS')).toBe(1);
  });

  it('scores near matches high', () => {
    expect(levenshtein('DR5', 'DRS')).toBe(1);
    expect(similarity('DR5', 'DRS')).toBeGreaterThan(0.6);
  });
});

describe('matchTeamTag', () => {
  it('matches exact normalized tags', () => {
    expect(matchTeamTag('777A', TEAMS).match?.tag).toBe('777A');
    expect(matchTeamTag('DR$', TEAMS).match?.tag).toBe('DRS');
  });

  it('matches with OCR substitutions (DR5 -> DRS)', () => {
    const result = matchTeamTag('DR5', TEAMS);
    expect(result.match?.tag).toBe('DRS');
    expect(result.match?.score).toBeGreaterThan(0.8);
  });

  it('rejects unmatched text', () => {
    expect(matchTeamTag('ZZZ', TEAMS).match).toBeUndefined();
  });

  it('detects ambiguity between close teams', () => {
    const result = matchTeamTag('TITAN', ['TITAN', 'TITANS']);
    expect(result.ambiguous).toBeDefined();
    expect(result.ambiguous?.length).toBeGreaterThan(0);
  });

  it('handles empty input', () => {
    expect(matchTeamTag('', TEAMS)).toEqual({});
  });
});
