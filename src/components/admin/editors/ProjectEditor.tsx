import type { ProposalModule } from '@/types/proposal';
import { ValidatedInput } from '@/components/admin/ValidatedInput';
import { HelpPanel } from '@/components/admin/HelpPanel';
import { ImageUpload } from '@/components/admin/ImageUpload';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditorProps {
    module: ProposalModule;
    onUpdate: (data: any) => void;
}

export function ProjectEditor({ module, onUpdate }: EditorProps) {
    const data = module.data || {};
    const mediaType = data.mediaType || 'image';

    return (
        <div className="space-y-8">
            <HelpPanel title="Proyecto Individual">
                <p>Configura los detalles de este proyecto específico. Puedes añadir múltiples módulos de proyecto uno tras otro.</p>
            </HelpPanel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card/30 p-6 rounded-xl border border-border/40">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tipo de Medio</Label>
                        <Select
                            value={mediaType}
                            onValueChange={(val) => onUpdate({ mediaType: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="image">Imagen / Fotografía</SelectItem>
                                <SelectItem value="video">Video (YouTube/Vimeo)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {mediaType === 'image' ? (
                        <div className="space-y-2">
                            <Label>Imagen del Proyecto</Label>
                            <ImageUpload
                                value={data.imageUrl}
                                onChange={(url) => onUpdate({ imageUrl: url })}
                                className="aspect-video w-full"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <ValidatedInput
                                label="URL del Video (YouTube / Vimeo / MP4)"
                                value={data.videoUrl || ''}
                                onChange={(v) => onUpdate({ videoUrl: v })}
                                placeholder="https://youtube.com/watch?v=..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Se mostrará un reproductor embebido.
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <ValidatedInput
                        label="Título del Proyecto"
                        value={data.title}
                        onChange={(v) => onUpdate({ title: v })}
                        placeholder="Ej. Rediseño Corporativo"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <ValidatedInput
                            label="Categoría"
                            value={data.category || ''}
                            onChange={(v) => onUpdate({ category: v })}
                            placeholder="Ej. Branding"
                        />
                        <ValidatedInput
                            label="Enlace Externo (Opcional)"
                            value={data.link || ''}
                            onChange={(v) => onUpdate({ link: v })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="min-h-[120px]">
                        <ValidatedInput
                            label="Descripción / Contexto"
                            value={data.description || ''}
                            onChange={(v) => onUpdate({ description: v })}
                            multiline
                            placeholder="Describe el desafío y la solución de este proyecto..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
