import { useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUpload } from '@/hooks/useUpload';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove: () => void;
    label?: string;
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    label,
    className,
}: ImageUploadProps) {
    const { upload, loading } = useUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona una imagen válida.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error('La imagen es demasiado grande. Máximo 2MB.');
            return;
        }

        try {
            const uploadedUrl = await upload(file);
            onChange(uploadedUrl);
            toast.success('Imagen subida correctamente.');
        } catch (error) {
            console.error(error);
            toast.error('Error al subir la imagen al servidor.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={cn("space-y-2 w-full", className)}>
            {label && <label className="text-sm font-medium text-foreground">{label}</label>}

            <div className="relative group">
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept="image/*"
                />

                {value ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/30 group-hover:border-primary/50 transition-all shadow-sm">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-8 text-xs"
                            >
                                Cambiar
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={onRemove}
                                className="h-8 text-xs"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 aspect-video rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/30 hover:border-primary/50 cursor-pointer transition-all",
                            loading && "pointer-events-none opacity-50"
                        )}
                    >
                        {loading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        ) : (
                            <>
                                <div className="p-3 rounded-full bg-background border shadow-sm">
                                    <Upload className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-semibold">Haz clic para subir</p>
                                    <p className="text-[10px] text-muted-foreground">PNG, JPG o SVG (Máx. 2MB)</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
