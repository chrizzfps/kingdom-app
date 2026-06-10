import { describe, it, expect } from 'vitest';
import { sanitizeColors, isAllowedColor } from '@/lib/colors';

describe('colors', () => {
  it('sanitizes non-allowed colors to brand cyan', () => {
    const result = sanitizeColors(['#ff0000', 'hsl(var(--brand-blue))']);
    expect(result[0]).toBe('hsl(var(--brand-cyan))');
    expect(result[1]).toBe('hsl(var(--brand-blue))');
  });

  it('validates allowed colors', () => {
    expect(isAllowedColor('#33ccff')).toBe(true);
    expect(isAllowedColor('#ff0000')).toBe(false);
  });
});

