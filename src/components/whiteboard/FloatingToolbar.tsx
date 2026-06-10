import { memo } from 'react';
import { Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { useWhiteboardStore, useSelectedElements } from '@/store/whiteboardStore';

interface Props {
  onDelete: () => void;
}

export const FloatingToolbar = memo(({ onDelete }: Props) => {
  const selected = useSelectedElements();
  const { duplicateSelected, bringForward, sendBackward, selectedIds, stage } = useWhiteboardStore();

  if (selected.length === 0) return null;

  // Position toolbar above the first selected element (in screen coords)
  const first = selected[0];
  const screenX = first.x * stage.scale + stage.x;
  const screenY = first.y * stage.scale + stage.y;

  const singleId = selectedIds[0];

  return (
    <div
      className="absolute z-40 flex items-center gap-0.5 bg-zinc-900/95 border border-zinc-700/60 rounded-xl px-1.5 py-1 shadow-2xl backdrop-blur-xl"
      style={{ left: screenX, top: Math.max(8, screenY - 52) }}
    >
      <button
        title="Duplicar (Ctrl+D)"
        onClick={duplicateSelected}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-all"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {singleId && (
        <>
          <button
            title="Traer al frente"
            onClick={() => bringForward(singleId)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-all"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            title="Enviar atrás"
            onClick={() => sendBackward(singleId)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-all"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      <div className="w-px h-4 bg-zinc-700/60 mx-0.5" />

      <button
        title="Eliminar (Delete)"
        onClick={onDelete}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

FloatingToolbar.displayName = 'FloatingToolbar';
