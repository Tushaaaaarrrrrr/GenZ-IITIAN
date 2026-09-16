import { describe, expect, it } from 'vitest';
import {
  cgpa,
  clampBonus,
  clampMark,
  computeNonOppe,
  computeOppe,
  letterFor,
  neededFinalNonOppe,
  neededFinalOppe,
  percentageFromCgpa,
  pointsForLetter,
  sgpa,
} from './grading';

describe('letterFor (grade boundaries)', () => {
  it('39.99 -> U', () => expect(letterFor(39.99)).toBe('U'));
  it('40 -> E', () => expect(letterFor(40)).toBe('E'));
  it('49.99 -> E', () => expect(letterFor(49.99)).toBe('E'));
  it('50 -> D', () => expect(letterFor(50)).toBe('D'));
  it('59.99 -> D', () => expect(letterFor(59.99)).toBe('D'));
  it('60 -> C', () => expect(letterFor(60)).toBe('C'));
  it('69.99 -> C', () => expect(letterFor(69.99)).toBe('C'));
  it('70 -> B', () => expect(letterFor(70)).toBe('B'));
  it('79.99 -> B', () => expect(letterFor(79.99)).toBe('B'));
  it('80 -> A', () => expect(letterFor(80)).toBe('A'));
  it('89.99 -> A', () => expect(letterFor(89.99)).toBe('A'));
  it('90 -> S', () => expect(letterFor(90)).toBe('S'));
  it('100 -> S', () => expect(letterFor(100)).toBe('S'));
  it('0 -> U', () => expect(letterFor(0)).toBe('U'));
});

describe('pointsForLetter', () => {
  it('maps every letter to its grade point, U and W both 0', () => {
    expect(pointsForLetter('S')).toBe(10);
    expect(pointsForLetter('A')).toBe(9);
    expect(pointsForLetter('B')).toBe(8);
    expect(pointsForLetter('C')).toBe(7);
    expect(pointsForLetter('D')).toBe(6);
    expect(pointsForLetter('E')).toBe(4);
    expect(pointsForLetter('U')).toBe(0);
    expect(pointsForLetter('W')).toBe(0);
  });
});

describe('clamping', () => {
  it('clamps marks to 0-100', () => {
    expect(clampMark(-5)).toBe(0);
    expect(clampMark(150)).toBe(100);
    expect(clampMark(72.5)).toBe(72.5);
  });

  it('clamps bonus to 0-20', () => {
    expect(clampBonus(-1)).toBe(0);
    expect(clampBonus(25)).toBe(20);
    expect(clampBonus(12)).toBe(12);
  });
});

describe('computeNonOppe (best of two formulas)', () => {
  it('picks formulaA when it is larger', () => {
    // Qz1 dominant, low Qz2: formulaA = 0.6*80 + 0.3*90 = 75; formulaB = 0.45*80+0.25*90+0.3*20 = 64.5
    const result = computeNonOppe({ qz1: 90, qz2: 20, final: 80 });
    expect(result.formulaA).toBeCloseTo(75, 5);
    expect(result.formulaB).toBeCloseTo(64.5, 5);
    expect(result.used).toBe('A');
    expect(result.T).toBeCloseTo(75, 5);
    expect(result.letter).toBe('B');
  });

  it('picks formulaB when it is larger', () => {
    // Even quizzes: formulaA = 0.6*80+0.3*70=69; formulaB=0.45*80+0.25*70+0.3*70=36+17.5+21=74.5
    const result = computeNonOppe({ qz1: 70, qz2: 70, final: 80 });
    expect(result.formulaA).toBeCloseTo(69, 5);
    expect(result.formulaB).toBeCloseTo(74.5, 5);
    expect(result.used).toBe('B');
    expect(result.T).toBeCloseTo(74.5, 5);
    expect(result.letter).toBe('B');
  });

  it('clamps bonus so T never exceeds 100', () => {
    const result = computeNonOppe({ qz1: 100, qz2: 100, final: 100, bonus: 20 });
    expect(result.T).toBe(100);
    expect(result.letter).toBe('S');
  });

  it('clamps out-of-range inputs before computing', () => {
    const result = computeNonOppe({ qz1: -20, qz2: 150, final: 80 });
    // qz1 clamped to 0, qz2 clamped to 100
    expect(result.formulaA).toBeCloseTo(0.6 * 80 + 0.3 * 100, 5);
  });
});

describe('computeOppe', () => {
  it('applies the weighted OPPE formula', () => {
    // T = 0.15*80 + 0.4*70 + 0.25*max(90,60) + 0.2*min(90,60)
    //   = 12 + 28 + 22.5 + 12 = 74.5
    const result = computeOppe({ qz1: 80, final: 70, pe1: 90, pe2: 60 });
    expect(result.T).toBeCloseTo(74.5, 5);
    expect(result.letter).toBe('B');
  });

  it('clamps bonus at 100 total', () => {
    const result = computeOppe({ qz1: 100, final: 100, pe1: 100, pe2: 100, bonus: 20 });
    expect(result.T).toBe(100);
    expect(result.letter).toBe('S');
  });
});

describe('SGPA with mixed credits', () => {
  it('weights grade points by credits', () => {
    // (4*10 + 3*8) / (4+3) = (40+24)/7 = 64/7 ≈ 9.142857
    const result = sgpa([
      { credits: 4, grade: 'S' },
      { credits: 3, grade: 'B' },
    ]);
    expect(result).toBeCloseTo(64 / 7, 5);
  });

  it('returns 0 for an empty course list', () => {
    expect(sgpa([])).toBe(0);
  });
});

describe('CGPA across multiple terms including a U grade', () => {
  it('keeps U-graded credits in the denominator', () => {
    const term1 = [
      { credits: 4, grade: 'S' as const },
      { credits: 4, grade: 'A' as const },
    ];
    const term2 = [
      { credits: 4, grade: 'U' as const }, // 0 points, but credits still count
      { credits: 4, grade: 'B' as const },
    ];
    // points = 4*10 + 4*9 + 4*0 + 4*8 = 40+36+0+32 = 108; credits = 16
    const result = cgpa([term1, term2]);
    expect(result).toBeCloseTo(108 / 16, 5);
  });

  it('percentageFromCgpa multiplies by 10', () => {
    expect(percentageFromCgpa(8.5)).toBe(85);
  });
});

describe('neededFinalNonOppe solver branches', () => {
  it('reports "already" when the cutoff is met without any Final', () => {
    // formulaA at F=0 = 0.3*100 = 30, formulaB at F=0 = 0.25*100+0.3*100 = 55
    // both are already >= the E cutoff (40) via formulaB, so E is "already there"
    const rows = neededFinalNonOppe(100, 100);
    const eRow = rows.find((r) => r.letter === 'E')!;
    expect(eRow.status).toBe('already');
  });

  it('reports a required value within range', () => {
    const rows = neededFinalNonOppe(50, 50);
    // formulaA(F) = 0.6F + 15, formulaB(F) = 0.45F + 12.5+15 = 0.45F+27.5
    // For D cutoff (50): F_A = (50-15)/0.6 = 58.333..., F_B = (50-27.5)/0.45 = 50
    const dRow = rows.find((r) => r.letter === 'D')!;
    expect(dRow.status).toBe('value');
    expect(dRow.requiredFinal).toBeCloseTo(50, 1);
  });

  it('reports "unreachable" when even a perfect Final is not enough', () => {
    const rows = neededFinalNonOppe(0, 0);
    const sRow = rows.find((r) => r.letter === 'S')!;
    // formulaA(100) = 60, formulaB(100)=45 -> max 60 < 90
    expect(sRow.status).toBe('unreachable');
  });
});

describe('neededFinalOppe solver branches', () => {
  it('reports "already" when the cutoff is met without any Final', () => {
    const rows = neededFinalOppe(100, 100, 100, 20);
    const sRow = rows.find((r) => r.letter === 'S')!;
    // withoutFinal = 0.15*100+0.25*100+0.2*100+20 = 15+25+20+20 = 80 -> not S(90) yet actually
    // check a lower band instead
    const bRow = rows.find((r) => r.letter === 'B')!;
    expect(bRow.status).toBe('already');
    expect(sRow.status).not.toBe('unreachable');
  });

  it('reports a required value within range', () => {
    const rows = neededFinalOppe(50, 50, 50, 0);
    // withoutFinal = 0.15*50+0.25*50+0.2*50 = 7.5+12.5+10 = 30
    // D cutoff 50: required F = (50-30)/0.4 = 50
    const dRow = rows.find((r) => r.letter === 'D')!;
    expect(dRow.status).toBe('value');
    expect(dRow.requiredFinal).toBeCloseTo(50, 1);
  });

  it('reports "unreachable" when even a perfect Final is not enough', () => {
    const rows = neededFinalOppe(0, 0, 0, 0);
    const sRow = rows.find((r) => r.letter === 'S')!;
    // withoutFinal = 0, atF100 = 40 < 90
    expect(sRow.status).toBe('unreachable');
  });
});
