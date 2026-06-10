import type { Proposal } from '@/types/proposal';

export interface ValidationIssue {
  moduleId?: string;
  message: string;
}

export function validateProposal(proposal: Proposal): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  proposal.modules.forEach((m) => {
    if (m.type === 'HERO') {
      const d = m.data || {};
      if (!d.title || !d.subtitle) {
        issues.push({ moduleId: m.id, message: 'HERO requiere título y subtítulo.' });
      }
    }
    if (m.type === 'PRICING') {
      const items = (m.data?.globalItems || []) as any[];
      if (!items.length) issues.push({ moduleId: m.id, message: 'PRICING requiere al menos un ítem.' });
    }
  });
  return issues;
}
