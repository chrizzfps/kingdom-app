import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ProposalModule } from '@/types/proposal';
import { ValidatedInput } from '@/components/admin/ValidatedInput';
import { HelpPanel } from '@/components/admin/HelpPanel';

interface EditorProps {
    module: ProposalModule;
    onUpdate: (data: any) => void;
}

export function IntroEditor({ module, onUpdate }: EditorProps) {
    const data = module.data;

    const handleChange = (field: string, value: string) => {
        onUpdate({ [field]: value });
    }

    return (
        <div className="space-y-4">
            <HelpPanel title="Guía de Redacción">
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>El Problema:</strong> Describe el dolor o desafío actual del cliente.</li>
                    <li><strong>La Solución:</strong> Resume cómo tu propuesta resuelve ese dolor.</li>
                    <li>Sé directo y empático.</li>
                </ul>
            </HelpPanel>

            <ValidatedInput
                label="Título de la Sección"
                value={data.heading || ''}
                onChange={(v) => handleChange('heading', v)}
                placeholder="Ej: Entendiendo tu Desafío"
                rules={{ required: true, minLength: 3, maxLength: 120 }}
            />

            <div className="space-y-2">
                <Label>El Problema / Situación Actual</Label>
                <Textarea
                    value={data.content || ''}
                    onChange={e => handleChange('content', e.target.value)}
                    className="min-h-[150px] bg-background/50"
                    placeholder="Describe aquí la situación actual o los puntos de dolor detectados..."
                />
            </div>

            <div className="space-y-2">
                <Label>Nuestra Solución / Estrategia</Label>
                <Textarea
                    value={data.solutionSummary || ''}
                    onChange={e => handleChange('solutionSummary', e.target.value)}
                    className="min-h-[100px] bg-background/50"
                    placeholder="Resume brevemente cómo abordaremos estos desafíos..."
                />
            </div>
        </div>
    )
}
