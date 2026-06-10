export function applyDiscount(price: number, discountPercent: number): number {
  if (!discountPercent || discountPercent <= 0) return Math.round(Number(price) || 0);
  const p = Number(price) || 0;
  const d = Math.min(Math.max(Number(discountPercent), 0), 100);
  return Math.round(p * (1 - d / 100));
}

export function groupTotalsByCategory(items: Array<any>): Record<string, number> {
  const groups: Record<string, number> = {};
  items.forEach((item) => {
    const cat = item?.category || 'General';
    const val = applyDiscount(item?.price || 0, item?.discount ? item?.discountPercent || 0 : 0);
    groups[cat] = (groups[cat] || 0) + val;
  });
  return groups;
}

