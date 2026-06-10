import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ProposalModule } from '@/types/proposal';
import { ValidatedInput } from '@/components/admin/ValidatedInput';

interface EditorProps {
  module: ProposalModule;
  onUpdate: (data: any) => void;
}

export function TextEditor({ module, onUpdate }: EditorProps) {
  const data = module.data || {};

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg bg-card">
        <div className="px-4 py-3 text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>Usa párrafos cortos y claros</li>
            <li>Evita bloques largos sin respiro</li>
            <li>Apoya con bullets cuando corresponda</li>
          </ul>
        </div>
      </div>

      <ValidatedInput
        label="Título de la sección"
        value={data.heading || ''}
        onChange={(v) => onUpdate({ heading: v })}
        placeholder="Ej: Consideraciones del proyecto"
        rules={{ maxLength: 80 }}
      />

      <div className="space-y-2">
        <Label>Contenido</Label>
        <Textarea
          value={data.content || ''}
          onChange={e => onUpdate({ content: e.target.value })}
          className="min-h-[200px]"
          placeholder="Escribe el contenido libre..."
        />
      </div>
    </div>
  );
}
