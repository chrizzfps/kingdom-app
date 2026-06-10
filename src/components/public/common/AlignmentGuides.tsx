export function AlignmentGuides({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(to right, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px)',
      }}
      aria-hidden="true"
    />
  );
}

