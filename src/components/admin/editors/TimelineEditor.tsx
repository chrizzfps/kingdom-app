import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import type { ProposalModule } from '@/types/proposal';
import { ValidatedInput } from '@/components/admin/ValidatedInput';
import { HelpPanel } from '@/components/admin/HelpPanel';

interface EditorProps {
    module: ProposalModule;
    onUpdate: (data: any) => void;
}

export function TimelineEditor({ module, onUpdate }: EditorProps) {
    const steps = module.data?.steps || [];
    const useSameTimeline = module.data?.useSameTimeline ?? true;
    const heading = module.data?.heading ?? '';

    const handleChange = (index: number, field: string, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        onUpdate({ steps: newSteps });
    };

    const addStep = () => {
        onUpdate({ steps: [...steps, { phase: 'Fase 1', task: 'Descripción de la tarea' }] });
    };

    const removeStep = (index: number) => {
        onUpdate({ steps: steps.filter((_: any, i: number) => i !== index) });
    };

    return (
        <div className="space-y-6">
            <HelpPanel title="Ayuda rápida">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Fases breves y distinguibles (ej: "Semana 1", "Mes 2")</li>
                    <li>Marca pasos importantes para resaltarlos visualmente</li>
                    <li>Usa el badge para hitos clave (ej: "Entrega", "Revisión")</li>
                </ul>
            </HelpPanel>

            <ValidatedInput
                label="Título de la sección"
                value={heading}
                onChange={(v) => onUpdate({ heading: v })}
                placeholder="Ej: Cronograma del Proyecto"
                rules={{ maxLength: 80 }}
            />

            <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                        type="checkbox"
                        checked={useSameTimeline}
                        onChange={(e) => onUpdate({ useSameTimeline: e.target.checked })}
                        className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                    />
                    <div>
                        <span className="text-sm font-medium">Cronograma único para todas las opciones</span>
                        <p className="text-xs text-muted-foreground">
                            {useSameTimeline
                                ? 'Todos los paquetes comparten el mismo cronograma.'
                                : 'Cada paquete tiene su propio cronograma.'}
                        </p>
                    </div>
                </label>
            </div>

            <div className="flex justify-between items-center">
                <Label>Pasos del Cronograma</Label>
                <Button onClick={addStep} size="sm" variant="outline" className="h-8 border-dashed border-border">
                    <Plus className="mr-2 h-3 w-3" /> Añadir Paso
                </Button>
            </div>

            {steps.map((step: any, index: number) => (
                <div key={index} className="p-4 border border-border rounded-lg bg-card/50 relative group flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 mt-1">
                        {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-1">
                                <ValidatedInput
                                    label="Fase"
                                    value={step.phase}
                                    onChange={(v) => handleChange(index, 'phase', v)}
                                    rules={{ required: true, minLength: 2, maxLength: 32 }}
                                    placeholder="Ej: Semana 1"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <ValidatedInput
                                    label="Descripción de la tarea"
                                    value={step.task}
                                    onChange={(v) => handleChange(index, 'task', v)}
                                    rules={{ required: true, minLength: 3, maxLength: 120 }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border/50">
                            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                                <input
                                    type="checkbox"
                                    checked={!!step.important}
                                    onChange={(e) => handleChange(index, 'important', e.target.checked)}
                                    className="rounded border-primary text-primary focus:ring-primary"
                                />
                                <span className="font-medium">Marcar como importante</span>
                            </label>

                            <div className="flex items-center gap-2 flex-1 max-w-xs">
                                <Label className="whitespace-nowrap">Badge:</Label>
                                <Input
                                    value={step.badge || ''}
                                    onChange={(e) => handleChange(index, 'badge', e.target.value)}
                                    className="h-8 text-sm bg-background"
                                    placeholder="Opcional (ej: Entrega)"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeStep(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
