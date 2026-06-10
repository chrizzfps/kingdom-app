import React, { memo } from 'react';
import { clsx } from 'clsx';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import { MousePointer2, Square, Circle, Type, StickyNote, ArrowRight, Image, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Seleccionar (V)' },
  { id: 'rect', icon: Square, label: 'Rectángulo (R)' },
  { id: 'circle', icon: Circle, label: 'Círculo (C)' },
  { id: 'text', icon: Type, label: 'Texto (T)' },
  { id: 'sticky', icon: StickyNote, label: 'Nota (N)' },
  { id: 'arrow', icon: ArrowRight, label: 'Flecha (A)' },
  { id: 'image', icon: Image, label: 'Imagen (I)' },
] as const;

interface Props {
  onUploadImage: () => void;
}

export const Toolbar = memo(({ onUploadImage }: Props) => {
  const { tool, setTool, stage, setStage, resetStage } = useWhiteboardStore();

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') return;
      const map: Record<string, typeof tool> = {
        v: 'select', r: 'rect', c: 'circle', t: 'text', n: 'sticky', a: 'arrow', i: 'image',
      };
      const found = map[e.key.toLowerCase()];
      if (found) {
        if (found === 'image') { onUploadImage(); }
        else { setTool(found); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setTool, onUploadImage]);

  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.2 : 1 / 1.2;
    setStage({ scale: Math.min(5, Math.max(0.1, stage.scale * factor)) });
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-zinc-900/95 border border-zinc-700/60 rounded-xl px-2 py-1.5 shadow-2xl backdrop-blur-xl">
      {TOOLS.map(({ id, icon: Icon, label }) => (
        id === 'image' ? (
          <button
            key={id}
            title={label}
            onClick={onUploadImage}
            className="relative group p-2 rounded-lg transition-all duration-150 text-zinc-400 hover:text-white hover:bg-zinc-700/60"
          >
            <Icon className="w-4 h-4" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {label}
            </span>
          </button>
        ) : (
          <button
            key={id}
            title={label}
            onClick={() => setTool(id as typeof tool)}
            className={clsx(
              'relative group p-2 rounded-lg transition-all duration-150',
              tool === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/60'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {label}
            </span>
          </button>
        )
      ))}

      <div className="w-px h-6 bg-zinc-700/60 mx-1" />

      <button
        title="Zoom out"
        onClick={() => handleZoom('out')}
        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-all duration-150"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <span className="text-zinc-400 text-[11px] font-mono min-w-[40px] text-center select-none">
        {Math.round(stage.scale * 100)}%
      </span>
      <button
        title="Zoom in"
        onClick={() => handleZoom('in')}
        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-all duration-150"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        title="Reset view"
        onClick={resetStage}
        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-all duration-150"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';
