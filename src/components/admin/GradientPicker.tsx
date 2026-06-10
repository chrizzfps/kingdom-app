import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Gradient {
  colors: string[];
  angle: number;
  animate?: boolean;
}

interface GradientPickerProps {
  value?: Gradient;
  onChange: (g: Gradient) => void;
}

const PRESETS: Gradient[] = [
  { colors: ['#0054df', '#33ccff'], angle: 45, animate: true },
  { colors: ['#0a0a0a', '#33ccff'], angle: 90, animate: false },
  { colors: ['#33ccff', '#66ffcc'], angle: 135, animate: true },
];

export function GradientPicker({ value, onChange }: GradientPickerProps) {
  const [local, setLocal] = useState<Gradient>(value || PRESETS[0]);

  const apply = (g: Gradient) => {
    setLocal(g);
    onChange(g);
  };

  const updateColor = (idx: number, color: string) => {
    const next = { ...local, colors: local.colors.map((c, i) => (i === idx ? color : c)) };
    setLocal(next);
    onChange(next);
  };

  const updateAngle = (angle: number) => {
    const next = { ...local, angle };
    setLocal(next);
    onChange(next);
  };

  const updateAnimate = (animate: boolean) => {
    const next = { ...local, animate };
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => apply(p)}
            className="rounded-md h-16 border border-border overflow-hidden"
            style={{
              background: `linear-gradient(${p.angle}deg, ${p.colors.join(', ')})`,
              animation: p.animate ? 'gradientMove 6s ease infinite' : undefined,
            }}
            aria-label="Gradient preset"
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        {local.colors.map((c, i) => (
          <input key={i} type="color" value={c} onChange={(e) => updateColor(i, e.target.value)} className="h-8 w-12 bg-transparent" />
        ))}
        <Button variant="outline" size="sm" onClick={() => updateColor(local.colors.length, '#ffffff')}>
          + color
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Ángulo</label>
        <input type="range" min={0} max={360} value={local.angle} onChange={(e) => updateAngle(Number(e.target.value))} />
        <span className="text-xs text-muted-foreground">{local.angle}°</span>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Animar</label>
        <input type="checkbox" checked={!!local.animate} onChange={(e) => updateAnimate(e.target.checked)} />
      </div>
      <style>
        {`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        `}
      </style>
    </div>
  );
}
