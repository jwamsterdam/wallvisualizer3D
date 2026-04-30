import { describe, expect, it } from 'vitest';
import { formatMm } from './format';

describe('formatMm', () => {
  it('formats whole millimeters without decimals', () => {
    expect(formatMm(70)).toBe('70 mm');
  });

  it('formats fractional millimeters with one decimal', () => {
    expect(formatMm(12.5)).toBe('12.5 mm');
  });
});
