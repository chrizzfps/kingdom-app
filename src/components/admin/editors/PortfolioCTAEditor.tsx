import type { ProposalModule } from '@/types/proposal';
import { ValidatedInput } from '@/components/admin/ValidatedInput';
import { HelpPanel } from '@/components/admin/HelpPanel';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface EditorProps {
    module: ProposalModule;
    onUpdate: (data: any) => void;
}

export function PortfolioCTAEditor({ module, onUpdate }: EditorProps) {
    const data = module.data || {};

    return (
        <div className="space-y-8">
            <HelpPanel title="Llamada a la Acción (Portfolio)">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Invita al visitante a contactarte.</li>
                    <li>Personaliza el texto del botón y el enlace (ej. a tu email o WhatsApp).</li>
                </ul>
            </HelpPanel>

            <div className="grid grid-cols-1 gap-6">
                <ValidatedInput
                    label="Título de Cierre"
                    value={data.title}
                    onChange={(v) => onUpdate({ title: v })}
                    placeholder="Ej. ¿Te gustó mi trabajo?"
                />
                <ValidatedInput
                    label="Texto secundario"
                    value={data.subtitle}
                    onChange={(v) => onUpdate({ subtitle: v })}
                    placeholder="Ej. Estoy disponible para nuevos proyectos"
                />

                <div className="space-y-6 bg-card/50 p-4 rounded-lg border border-border/50">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label>Opacidad del Overlay (%)</Label>
                            <span className="text-sm text-muted-foreground">{data.overlayOpacity ?? 10}%</span>
                        </div>
                        <Slider
                            defaultValue={[data.overlayOpacity ?? 10]}
                            max={95}
                            step={5}
                            onValueChange={(vals) => onUpdate({ overlayOpacity: vals[0] })}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label>Desefoque / Blur (px)</Label>
                            <span className="text-sm text-muted-foreground">{data.overlayBlur ?? 100}px</span>
                        </div>
                        <Slider
                            defaultValue={[data.overlayBlur ?? 100]}
                            max={150}
                            step={10}
                            onValueChange={(vals) => onUpdate({ overlayBlur: vals[0] })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ValidatedInput
                        label="Texto del Botón"
                        value={data.buttonText}
                        onChange={(v) => onUpdate({ buttonText: v })}
                        placeholder="Ej. Escríbeme"
                    />
                    <ValidatedInput
                        label="Enlace del Botón / Email"
                        value={data.buttonLink}
                        onChange={(v) => onUpdate({ buttonLink: v })}
                        placeholder="mailto:hola@ejemplo.com"
                    />
                </div>
            </div>
        </div>
    );
}
