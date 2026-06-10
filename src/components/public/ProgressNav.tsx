interface ProgressNavProps {
  count: number;
  active: number;
  onJump: (index: number) => void;
}

export function ProgressNav({ count, active, onJump }: ProgressNavProps) {
  return (
    <div className="hidden md:flex fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-2.5 rounded-full bg-white/70 backdrop-blur-md border border-zinc-200 px-2 py-3 shadow-sm">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          aria-label={`Ir a la sección ${i + 1}`}
          onClick={() => onJump(i)}
          className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full transition-all ${
            active === i ? 'bg-zinc-900 scale-110' : 'bg-zinc-300 hover:bg-zinc-500'
          }`}
        />
      ))}
    </div>
  );
}
