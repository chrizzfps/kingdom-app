import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpload } from '@/hooks/useUpload';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    className?: string;
    description?: string;
}

export function ImageUpload({ value, onChange, className, description }: ImageUploadProps) {
    const [error, setError] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { upload, deleteFile, loading, progress } = useUpload();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        try {
            const url = await upload(file);
            console.log('ImageUpload received URL:', url);
            onChange(url);
        } catch (err) {
            setError((err as any)?.message || 'Error uploading image');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async () => {
        if (!value) return;

        // Optimistic update or wait? User asked for "Eliminar del servidor".
        const success = await deleteFile(value);
        if (success) {
            onChange('');
            setShowDeleteDialog(false);
        } else {
            setError('No se pudo eliminar la imagen. Intente nuevamente.');
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {value ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-card group">
                    <img src={value} alt="Preview" className="w-full h-full object-cover transition-opacity group-hover:opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            className="h-9 w-9 p-0 rounded-full"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-blue/40 hover:bg-muted transition-colors",
                        loading && "opacity-50 pointer-events-none"
                    )}
                >
                    {loading ? (
                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
                    ) : (
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    )}
                    <span className="text-sm font-medium text-zinc-300">
                        {loading ? `Procesando... ${progress > 0 ? `${progress}%` : ''}` : 'Clic para subir imagen'}
                    </span>
                    {description && (
                        <span className="text-xs text-muted-foreground mt-1">{description}</span>
                    )}
                </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar imagen?</DialogTitle>
                        <DialogDescription>
                            Esta acción eliminará permanentemente la imagen del servidor. Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
