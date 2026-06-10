import { memo } from 'react';
import { useWhiteboardStore, useFirstSelected } from '@/store/whiteboardStore';
import type { WhiteboardElement } from '@/types/whiteboard';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: '"Playfair Display", serif', label: 'Playfair Display' },
  { value: '"Caveat", cursive', label: 'Caveat (Mano)' },
  { value: '"Fira Code", monospace', label: 'Fira Code' },
];

// Minimal color swatch palette
const COLORS = [
  '#18181b', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#fef08a',
  '#bae6fd', '#bbf7d0', '#fecdd3',
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];
const STICKY_COLORS = ['#fef08a', '#bae6fd', '#bbf7d0', '#fecdd3', '#e9d5ff', '#fed7aa'];

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  return (
    <div className="space-y-2">
      <span className="text-xs text-zinc-400 uppercase tracking-wider">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={c}
            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: c,
              borderColor: value === c ? '#6366f1' : 'transparent',
              boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px rgba(0,0,0,0.15)' : undefined,
            }}
          />
        ))}
        {/* Custom color */}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 rounded-full cursor-pointer border-0 p-0 bg-transparent"
          title="Color personalizado"
        />
      </div>
    </div>
  );
}

export const StylePanel = memo(() => {
  const el = useFirstSelected();
  const { updateElement } = useWhiteboardStore();

  if (!el) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
          <span className="text-zinc-500 text-lg">✦</span>
        </div>
        <p className="text-zinc-500 text-sm">Selecciona un elemento para editar sus estilos</p>
      </div>
    );
  }

  const update = (patch: Partial<WhiteboardElement>) => updateElement(el.id, patch);

  return (
    <div className="space-y-5 px-4 py-4">
      <div className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">
        {el.type.charAt(0).toUpperCase() + el.type.slice(1)}
      </div>

      {/* Fill / background color */}
      {(el.type === 'rect' || el.type === 'circle' || el.type === 'sticky') && (
        <ColorRow
          label={el.type === 'sticky' ? 'Color de nota' : 'Relleno'}
          value={el.type === 'sticky' ? el.fill : (el as any).fill}
          onChange={(c) => update({ fill: c } as any)}
        />
      )}

      {/* Sticky colors */}
      {el.type === 'sticky' && (
        <div className="space-y-2">
          <span className="text-xs text-zinc-400 uppercase tracking-wider">Color rápido</span>
          <div className="flex gap-1.5">
            {STICKY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => update({ fill: c } as any)}
                className="w-6 h-6 rounded border-2 transition-all hover:scale-110"
                style={{ background: c, borderColor: el.fill === c ? '#6366f1' : 'transparent' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Text color */}
      {el.type === 'text' && (
        <ColorRow
          label="Color de texto"
          value={(el as any).fill}
          onChange={(c) => update({ fill: c } as any)}
        />
      )}

      {/* Sticky text color */}
      {el.type === 'sticky' && (
        <ColorRow
          label="Color de texto"
          value={(el as any).textColor}
          onChange={(c) => update({ textColor: c } as any)}
        />
      )}

      {/* Stroke */}
      {(el.type === 'rect' || el.type === 'circle') && (
        <>
          <ColorRow
            label="Borde"
            value={(el as any).stroke || '#transparent'}
            onChange={(c) => update({ stroke: c } as any)}
          />
          <div className="space-y-2">
            <span className="text-xs text-zinc-400 uppercase tracking-wider">Grosor de borde</span>
            <input
              type="range" min={0} max={12} step={1}
              value={(el as any).strokeWidth || 0}
              onChange={(e) => update({ strokeWidth: Number(e.target.value) } as any)}
              className="w-full accent-indigo-500"
            />
            <span className="text-xs text-zinc-500">{(el as any).strokeWidth || 0}px</span>
          </div>
        </>
      )}

      {/* Arrow color */}
      {el.type === 'arrow' && (
        <>
          <ColorRow
            label="Color"
            value={(el as any).stroke}
            onChange={(c) => update({ stroke: c, fill: c } as any)}
          />
          <div className="space-y-2">
            <span className="text-xs text-zinc-400 uppercase tracking-wider">Grosor</span>
            <input
              type="range" min={1} max={10} step={0.5}
              value={(el as any).strokeWidth}
              onChange={(e) => update({ strokeWidth: Number(e.target.value) } as any)}
              className="w-full accent-indigo-500"
            />
            <span className="text-xs text-zinc-500">{(el as any).strokeWidth}px</span>
          </div>
        </>
      )}

      {/* Font Family */}
      {el.type === 'text' && (
        <div className="space-y-2">
          <span className="text-xs text-zinc-400 uppercase tracking-wider">Tipografía</span>
          <select
            value={(el as any).fontFamily || FONTS[0].value}
            onChange={(e) => update({ fontFamily: e.target.value } as any)}
            className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-700/60 transition-all font-medium"
            style={{ fontFamily: (el as any).fontFamily }}
          >
            {FONTS.map(f => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Font size */}
      {(el.type === 'text' || el.type === 'sticky') && (
        <div className="space-y-2">
          <span className="text-xs text-zinc-400 uppercase tracking-wider">Tamaño de fuente</span>
          <div className="flex flex-wrap gap-1">
            {FONT_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => update({ fontSize: s } as any)}
                className={`px-2 py-0.5 rounded text-xs transition-all ${
                  (el as any).fontSize === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text align */}
      {el.type === 'text' && (
        <div className="space-y-2">
          <span className="text-xs text-zinc-400 uppercase tracking-wider">Alineación</span>
          <div className="flex gap-1">
            {[
              { id: 'left', icon: AlignLeft },
              { id: 'center', icon: AlignCenter },
              { id: 'right', icon: AlignRight },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => update({ align: id } as any)}
                title={`Alinear ${id}`}
                className={`flex-1 py-1.5 flex justify-center rounded transition-all ${
                  (el as any).align === id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Font style (bold / italic) */}
      {el.type === 'text' && (
        <div className="space-y-2">
          <span className="text-xs text-zinc-400 uppercase tracking-wider">Estilo</span>
          <div className="flex gap-1">
            {[
              { label: 'B', style: 'bold', match: 'bold' },
              { label: 'I', style: 'italic', match: 'italic' },
            ].map(({ label, style, match }) => {
              const current = (el as any).fontStyle || 'normal';
              const active = current.includes(match);
              return (
                <button
                  key={style}
                  onClick={() => {
                    let next = current;
                    if (active) { next = next.replace(match, '').trim(); }
                    else { next = (next + ' ' + match).trim(); }
                    update({ fontStyle: next || 'normal' } as any);
                  }}
                  className={`w-8 h-8 rounded text-sm font-${style} transition-all ${
                    active ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Opacity */}
      <div className="space-y-2">
        <span className="text-xs text-zinc-400 uppercase tracking-wider">Opacidad</span>
        <input
          type="range" min={0.1} max={1} step={0.05}
          value={el.opacity}
          onChange={(e) => update({ opacity: Number(e.target.value) })}
          className="w-full accent-indigo-500"
        />
        <span className="text-xs text-zinc-500">{Math.round(el.opacity * 100)}%</span>
      </div>

      {/* Corner radius for rect */}
      {el.type === 'rect' && (
        <div className="space-y-2">
          <span className="text-xs text-zinc-400 uppercase tracking-wider">Radio de borde</span>
          <input
            type="range" min={0} max={60} step={2}
            value={(el as any).cornerRadius}
            onChange={(e) => update({ cornerRadius: Number(e.target.value) } as any)}
            className="w-full accent-indigo-500"
          />
          <span className="text-xs text-zinc-500">{(el as any).cornerRadius}px</span>
        </div>
      )}
    </div>
  );
});

StylePanel.displayName = 'StylePanel';
