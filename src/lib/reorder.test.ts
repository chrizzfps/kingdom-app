import { describe, it, expect } from 'vitest';
import { reorderList } from './reorder';

describe('reorderList', () => {
  const base = [
    { id: 'a', type: 'TEXT', isVisible: true, order: 0, data: {} },
    { id: 'b', type: 'TEXT', isVisible: true, order: 1, data: {} },
    { id: 'c', type: 'TEXT', isVisible: true, order: 2, data: {} },
  ] as any;

  it('moves element and reindexes', () => {
    const res = reorderList(base, 'a', 'c');
    expect(res.map(m => m.id)).toEqual(['b','c','a']);
    expect(res.map(m => m.order)).toEqual([0,1,2]);
  });

  it('returns original list if ids not found', () => {
    const res = reorderList(base, 'x', 'y');
    expect(res).toEqual(base);
  });
});
