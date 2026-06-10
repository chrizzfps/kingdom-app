import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResourceField } from '@/components/admin/ResourceField';
import type { ProposalModule } from '@/types/proposal';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ValidatedInput } from '@/components/admin/ValidatedInput';
import { HelpPanel } from '@/components/admin/HelpPanel';

interface EditorProps {
  module: ProposalModule;
  onUpdate: (data: any) => void;
}

export function ReferencesEditor({ module, onUpdate }: EditorProps) {
  const data = module.data || { items: [] };
  const items = data.items || [];

  const addItem = () => {
    const next = [...items, { title: '', url: '', imageUrl: '', category: '' }];
    onUpdate({ items: next });
  };

  const updateItem = (idx: number, field: string, value: string) => {
    const next = items.map((it: any, i: number) => (i === idx ? { ...it, [field]: value } : it));
    onUpdate({ items: next });
  };

  const removeItem = (idx: number) => {
    const next = items.filter((_: any, i: number) => i !== idx);
    onUpdate({ items: next });
  };

  return (
    <div className="space-y-6">
      <HelpPanel title="Ayuda rápida">
        <ul className="list-disc pl-5 space-y-1">
          <li>Título y categoría descriptivos (ej: "App móvil", "E-commerce")</li>
          <li>Enlace al proyecto o portafolio</li>
          <li>Imagen clara como miniatura</li>
        </ul>
      </HelpPanel>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <ValidatedInput
            label="Título de la sección"
            value={data.title || ''}
            onChange={(v) => onUpdate({ title: v })}
            rules={{ required: true, minLength: 2, maxLength: 80 }}
          />
        </div>
        <Button onClick={addItem} className="bg-primary hover:brightness-110 mt-6">
          <Plus className="h-4 w-4 mr-2" /> Añadir referencia
        </Button>
      </div>

      <div className="grid gap-6">
        {items.map((ref: any, idx: number) => (
          <div key={idx} className="rounded-lg border border-border p-5 bg-card/50 hover:bg-card transition-colors relative group">
            <div className="absolute top-4 right-4 z-10">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(idx)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pr-10">
              <ValidatedInput
                label="Título del proyecto"
                value={ref.title || ''}
                onChange={(v) => updateItem(idx, 'title', v)}
                rules={{ required: true, minLength: 2, maxLength: 80 }}
              />

              <ValidatedInput
                label="Categoría"
                value={ref.category || ''}
                onChange={(v) => updateItem(idx, 'category', v)}
                rules={{ minLength: 2, maxLength: 40 }}
                placeholder="Ej: E-commerce, Branding"
              />

              <div className="sm:col-span-2 space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={ref.description || ''}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  className="min-h-[80px] bg-background"
                  placeholder="Breve descripción del proyecto o resultado..."
                />
              </div>

              <div className="sm:col-span-2">
                <ValidatedInput
                  label="URL / Enlace"
                  value={ref.url || ''}
                  onChange={(v) => updateItem(idx, 'url', v)}
                  rules={{ pattern: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/ }}
                  placeholder="https://..."
                />
              </div>

              <div className="sm:col-span-2">
                <ResourceField
                  label="Imagen de referencia"
                  description="Miniatura ilustrativa del proyecto"
                  value={ref.imageUrl || ''}
                  onChange={(url) => updateItem(idx, 'imageUrl', url)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
