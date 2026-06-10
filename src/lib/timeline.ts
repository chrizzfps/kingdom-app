export function getDotClasses(step: any): string {
  return step?.important
    ? 'bg-brand-cyan shadow-[0_0_16px_rgba(51,204,255,0.6)] animate-pulse'
    : 'bg-brand-blue shadow-[0_0_10px_rgba(0,84,223,0.4)]';
}

export function getTaskClasses(isActive: boolean): string {
  return isActive ? 'text-brand-cyan' : '';
}

