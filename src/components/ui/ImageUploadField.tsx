import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { useUpload } from '@/hooks/useUpload';
import { cn } from '@/lib/utils';

interface ImageUploadFieldProps {
    label: string;
    value?: string;
    onChange: (url: string) => void;
    placeholder?: string;
}

export function ImageUploadField({ label, value, onChange, placeholder }: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { upload, loading, progress, error } = useUpload();
    const [previewError, setPreviewError] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const url = await upload(file);
            onChange(url);
            setPreviewError(false);
        } catch (err) {
            console.error('Upload failed:', err);
        }

        // Reset input
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleClear = () => {
        onChange('');
        setPreviewError(false);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex gap-2 items-center">
                {/* Hidden file input */}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Preview or placeholder */}
                <div
                    className={cn(
                        "h-16 w-24 rounded-md border border-dashed flex items-center justify-center overflow-hidden bg-muted/50",
                        value && !previewError && "border-solid"
                    )}
                >
                    {value && !previewError ? (
                        <img
                            src={value}
                            alt={label}
                            className="h-full w-full object-cover"
                            onError={() => setPreviewError(true)}
                        />
                    ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>

                {/* Upload button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={loading}
                    className="flex-shrink-0"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {progress}%
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            Subir
                        </>
                    )}
                </Button>

                {/* Clear button */}
                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* URL fallback input */}
            <Input
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || 'https://...'}
                className="text-xs"
            />

            {/* Error display */}
            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    );
}
