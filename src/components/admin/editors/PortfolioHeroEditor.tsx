import type { ProposalModule } from '@/types/proposal';
import { ValidatedInput } from '@/components/admin/ValidatedInput';
import { HelpPanel } from '@/components/admin/HelpPanel';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface EditorProps {
    module: ProposalModule;
    onUpdate: (data: any) => void;
}

export function PortfolioHeroEditor({ module, onUpdate }: EditorProps) {
    const data = module.data || {};

    return (
        <div className="space-y-8">
            <HelpPanel title="Portada de Portafolio">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Sube una imagen o foto tuya impactante.</li>
                    <li>Define un título claro (ej. "Mi Portafolio Creativo").</li>
                    <li>Usa el subtítulo para definir tu especialidad (ej. "Diseño de Marca & Estrategia").</li>
                </ul>
            </HelpPanel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <ValidatedInput
                            label="Título Principal"
                            value={data.title}
                            onChange={(v) => onUpdate({ title: v })}
                            placeholder="Ej. Juan Pérez - Logofolio"
                        />
                        <ValidatedInput
                            label="Subtítulo / Especialidad"
                            value={data.subtitle}
                            onChange={(v) => onUpdate({ subtitle: v })}
                            placeholder="Ej. Diseñador Gráfico Senior"
                        />
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border">
                        <div className="flex items-center justify-between">
                            <Label>Redes Sociales</Label>
                            <Switch
                                checked={data.showSocialLinks !== false}
                                onCheckedChange={(c) => onUpdate({ showSocialLinks: c })}
                            />
                        </div>

                        {(data.showSocialLinks !== false) && (
                            <div className="grid grid-cols-1 gap-3 pl-3 border-l-2 border-border ml-1">
                                <ValidatedInput
                                    label="Instagram URL"
                                    value={data.socialLinks?.instagram || ''}
                                    onChange={(v) => onUpdate({ socialLinks: { ...data.socialLinks, instagram: v } })}
                                    placeholder="https://instagram.com/..."
                                />
                                <ValidatedInput
                                    label="LinkedIn URL"
                                    value={data.socialLinks?.linkedin || ''}
                                    onChange={(v) => onUpdate({ socialLinks: { ...data.socialLinks, linkedin: v } })}
                                    placeholder="https://linkedin.com/in/..."
                                />
                                <ValidatedInput
                                    label="Behance / Dribbble URL"
                                    value={data.socialLinks?.behance || ''}
                                    onChange={(v) => onUpdate({ socialLinks: { ...data.socialLinks, behance: v } })}
                                    placeholder="https://behance.net/..."
                                />
                                <ValidatedInput
                                    label="Website Proper URL"
                                    value={data.socialLinks?.website || ''}
                                    onChange={(v) => onUpdate({ socialLinks: { ...data.socialLinks, website: v } })}
                                    placeholder="https://misitio.com"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block">Imagen de Fondo / Perfil</Label>
                    <ImageUpload
                        value={data.backgroundImageUrl}
                        onChange={(url) => onUpdate({ backgroundImageUrl: url })}
                        className="aspect-video w-full rounded-xl overflow-hidden border border-border/50"
                    />

                    <div className="mt-6 space-y-6 bg-card/50 p-4 rounded-lg border border-border/50">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Opacidad del Overlay (%)</Label>
                                <span className="text-sm text-muted-foreground">{data.overlayOpacity ?? 30}%</span>
                            </div>
                            <Slider
                                defaultValue={[data.overlayOpacity ?? 30]}
                                max={95}
                                step={5}
                                onValueChange={(vals) => onUpdate({ overlayOpacity: vals[0] })}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Desefoque / Blur (px)</Label>
                                <span className="text-sm text-muted-foreground">{data.overlayBlur ?? 0}px</span>
                            </div>
                            <Slider
                                defaultValue={[data.overlayBlur ?? 0]}
                                max={20}
                                step={1}
                                onValueChange={(vals) => onUpdate({ overlayBlur: vals[0] })}
                            />
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                        Ajusta la opacidad y el desenfoque para mejorar la legibilidad del texto sobre la imagen.
                    </p>
                </div>
            </div>
        </div>
    );
}
