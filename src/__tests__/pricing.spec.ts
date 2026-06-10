import { describe, it, expect } from 'vitest';
import { applyDiscount, groupTotalsByCategory } from '@/lib/pricing';

describe('pricing utils', () => {
  it('applyDiscount computes discounted price', () => {
    expect(applyDiscount(100, 10)).toBe(90);
    expect(applyDiscount(200, 0)).toBe(200);
    expect(applyDiscount(100, 120)).toBe(0);
  });

  it('groupTotalsByCategory sums with discounts', () => {
    const items = [
      { category: 'Design', price: 100 },
      { category: 'Design', price: 50, discount: true, discountPercent: 10 },
      { category: 'Dev', price: 200, discount: true, discountPercent: 25 },
      { price: 30 },
    ];
    const groups = groupTotalsByCategory(items);
    expect(groups['Design']).toBe(145);
    expect(groups['Dev']).toBe(150);
    expect(groups['General']).toBe(30);
  });
});

