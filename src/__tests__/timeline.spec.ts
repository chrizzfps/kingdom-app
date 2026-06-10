import { describe, it, expect } from 'vitest';
import { getDotClasses, getTaskClasses } from '@/lib/timeline';

describe('timeline utils', () => {
  it('dot classes reflect important flag', () => {
    expect(getDotClasses({ important: true })).toMatch(/animate-pulse/);
    expect(getDotClasses({ important: false })).toMatch(/brand-blue/);
  });

  it('task classes reflect active state', () => {
    expect(getTaskClasses(true)).toContain('brand-cyan');
    expect(getTaskClasses(false)).toBe('');
  });
});

