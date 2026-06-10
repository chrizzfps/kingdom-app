import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ProposalModule } from '@/types/proposal';
import { ValidatedInput } from '@/components/admin/ValidatedInput';

interface EditorProps {
    module: ProposalModule;
    onUpdate: (data: any) => void;
}

export function CTAEditor({ module, onUpdate }: EditorProps) {
    const data = module.data;

    const handleChange = (field: string, value: string) => {
        onUpdate({ [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Título Principal</Label>
                <Input
                    value={data.title || ''}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder="Ej: ¿Listo para empezar?"
                />
                <p className="text-xs text-muted-foreground">Texto principal del llamado a la acción.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Texto del botón</Label>
                    <Input
                        value={data.buttonText || ''}
                        onChange={e => handleChange('buttonText', e.target.value)}
                        placeholder="Ej: Hablemos"
                    />
                </div>
                <div className="space-y-2">
                    <Label>URL del botón</Label>
                    <Input
                        value={data.buttonLink || ''}
                        onChange={e => handleChange('buttonLink', e.target.value)}
                        placeholder="https://..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <ValidatedInput
                    label="Número de WhatsApp"
                    value={data.whatsapp || ''}
                    onChange={(v) => handleChange('whatsapp', v)}
                    rules={{ pattern: /^\+?\d{6,15}$/ }}
                    placeholder="+58 412 000 0000"
                />
                <ValidatedInput
                    label="Correo electrónico"
                    value={data.email || ''}
                    onChange={(v) => handleChange('email', v)}
                    rules={{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }}
                    placeholder="hola@agencia.com"
                />
            </div>

            <div className="space-y-2">
                <Label>Mensaje pre-escrito para WhatsApp</Label>
                <Textarea
                    value={data.whatsappMessage || ''}
                    onChange={e => handleChange('whatsappMessage', e.target.value)}
                    className="min-h-[80px] bg-background/50"
                    placeholder="Ej: Hola, vi la propuesta para mi proyecto y me gustaría hablar..."
                />
                <p className="text-xs text-muted-foreground">
                    Si se configura, el botón de WhatsApp abrirá la conversación con este mensaje cargado.
                </p>
            </div>
        </div>
    );
}
