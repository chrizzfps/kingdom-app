import type { ProposalModule } from '@/types/proposal';

export function reorderList(list: ProposalModule[], activeId: string, overId: string) {
  const oldIndex = list.findIndex((m) => m.id === activeId);
  const newIndex = list.findIndex((m) => m.id === overId);
  if (oldIndex === -1 || newIndex === -1) return list;
  const copy = [...list];
  const moved = copy.splice(oldIndex, 1)[0];
  copy.splice(newIndex, 0, moved);
  return copy.map((m, idx) => ({ ...m, order: idx }));
}
