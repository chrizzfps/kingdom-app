import { useEffect, useState } from 'react';

export function CursorFX({ className = '' }: { className?: string }) {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEnabled(!mq.matches);
    const onMove = (e: PointerEvent) => {
      if (!enabled) return;
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-20 ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute w-40 h-40 rounded-full bg-[hsl(var(--brand-cyan))] opacity-20 blur-3xl transition-transform duration-300"
        style={{ transform: `translate(${pos.x - 80}px, ${pos.y - 80}px)` }}
      />
      <div
        className="absolute w-24 h-24 rounded-full bg-[hsl(var(--brand-blue))] opacity-10 blur-2xl transition-transform duration-300"
        style={{ transform: `translate(${pos.x - 48}px, ${pos.y - 48}px)` }}
      />
    </div>
  );
}

