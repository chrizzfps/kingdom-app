const allowed = [
  'hsl(var(--brand-blue))',
  'hsl(var(--brand-cyan))',
  'hsl(var(--foreground))',
  'hsl(var(--background))',
  '#0054df',
  '#33ccff',
  '#0a0a0a',
  '#f9fbfc',
  '#66ffcc',
];

export function sanitizeColors(colors: string[]): string[] {
  return colors.map((c) => (allowed.includes(c) ? c : 'hsl(var(--brand-cyan))'));
}

export function isAllowedColor(color: string): boolean {
  return allowed.includes(color);
}

