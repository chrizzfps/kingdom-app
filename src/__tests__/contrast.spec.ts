import { describe, it, expect } from 'vitest';
import { contrastRatio } from '@/lib/contrast';

describe('contrast', () => {
  it('foreground vs dark background meets WCAG 4.5:1', () => {
    // Approximate tokens: foreground ~ #ffffff on dark background ~ #0a0a0a
    const ratio = contrastRatio('#ffffff', '#0a0a0a');
    expect(ratio).toBeGreaterThanOrEqual(7); // AA large > 3, normal > 4.5; we target higher
  });

  it('brand cyan vs dark background is readable for large text', () => {
    const ratio = contrastRatio('#33ccff', '#0a0a0a');
    expect(ratio).toBeGreaterThanOrEqual(3); // large text AA
  });

  it('foreground vs light background meets WCAG 4.5:1', () => {
    const ratio = contrastRatio('#0a0a0a', '#f9fbfc');
    expect(ratio).toBeGreaterThanOrEqual(7);
  });
});

