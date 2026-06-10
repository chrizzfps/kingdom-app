import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GradientPicker } from '@/components/admin/GradientPicker';
import { ResourceField } from '@/components/admin/ResourceField';
import type { ProposalModule } from '@/types/proposal';
import { FocalPointPicker } from '@/components/admin/FocalPointPicker';
import { HelpPanel } from '@/components/admin/HelpPanel';
import { HeroModuleSchema, type HeroModuleData } from '@/types/schemas';
import { useDebounce } from '@/hooks/useDebounce';

interface EditorProps {
    module: ProposalModule;
    onUpdate: (data: any) => void;
}

export function HeroEditor({ module, onUpdate }: EditorProps) {
    const { register, watch, setValue, formState: { errors } } = useForm<HeroModuleData>({
        resolver: zodResolver(HeroModuleSchema),
        defaultValues: module.data as HeroModuleData,
        mode: 'onChange',
    });

    const formData = watch();
    const debouncedData = useDebounce(formData, 500);

    useEffect(() => {
        onUpdate(debouncedData);
    }, [debouncedData]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCustomChange = (field: keyof HeroModuleData, value: any) => {
        setValue(field, value, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <div className="space-y-4">
            <HelpPanel title="Ayuda rápida">
                <ul className="list-disc pl-5 space-y-1">
                    <li>Usa títulos concisos y claros</li>
                    <li>Subtítulo entre 60–160 caracteres</li>
                    <li>La imagen de fondo debe ser legible con texto encima</li>
                </ul>
            </HelpPanel>

            <div className="space-y-2">
                <Label htmlFor="title">Título Principal</Label>
                <Input
                    id="title"
                    {...register('title')}
                    className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                    id="subtitle"
                    {...register('subtitle')}
                    className={errors.subtitle ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.subtitle && <p className="text-xs text-destructive">{errors.subtitle.message}</p>}
            </div>

            <ResourceField
                label="Imagen de fondo"
                description="Recomendado: 1920×1080 WEBP/JPG"
                value={formData.backgroundImageUrl || ''}
                onChange={(url) => handleCustomChange('backgroundImageUrl', url)}
            />

            {formData.backgroundImageUrl && (
                <div className="bg-card/30 p-4 rounded-lg border border-border/50">
                    <FocalPointPicker
                        imageUrl={formData.backgroundImageUrl}
                        value={formData.backgroundPosition || { x: 50, y: 50 }}
                        onChange={(pos) => handleCustomChange('backgroundPosition', pos)}
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label>Fondo (degradado)</Label>
                <GradientPicker
                    value={formData.backgroundGradient}
                    onChange={(g) => handleCustomChange('backgroundGradient', g)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="buttonText">Texto del botón CTA</Label>
                    <Input
                        id="buttonText"
                        {...register('buttonText')}
                        placeholder="Ej: Ver propuesta"
                        className={errors.buttonText ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.buttonText && <p className="text-xs text-destructive">{errors.buttonText.message}</p>}
                </div>
                <div className="space-y-2 flex flex-col justify-end pb-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            {...register('showLogo')}
                            className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                        />
                        <Label className="cursor-pointer">Mostrar logo de la marca</Label>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Oscurecer fondo <span className="text-muted-foreground font-normal">({formData.overlay || 0}%)</span></Label>
                    <div className="h-10 flex items-center">
                        <input
                            type="range"
                            min={0}
                            max={80}
                            value={formData.overlay || 0}
                            onChange={(e) => handleCustomChange('overlay', Number(e.target.value))}
                            className="w-full cursor-pointer accent-primary"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Desenfocar fondo <span className="text-muted-foreground font-normal">({formData.blurLevel || 0}px)</span></Label>
                    <div className="h-10 flex items-center">
                        <input
                            type="range"
                            min={0}
                            max={20}
                            step={1}
                            value={formData.blurLevel || 0}
                            onChange={(e) => handleCustomChange('blurLevel', Number(e.target.value))}
                            className="w-full cursor-pointer accent-primary"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Alineación</Label>
                    <select
                        {...register('align')}
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <option value="left">Izquierda</option>
                        <option value="center">Centrado</option>
                        <option value="right">Derecha</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
