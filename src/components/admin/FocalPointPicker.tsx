import React, { useRef, useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';

interface Position {
    x: number;
    y: number;
}

interface Props {
    imageUrl?: string;
    value?: Position;
    onChange: (pos: Position) => void;
}

export function FocalPointPicker({ imageUrl, value = { x: 50, y: 50 }, onChange }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    const handleInteraction = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
        if (!containerRef.current || !imageUrl) return;

        const rect = containerRef.current.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;

        // Clamp values
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        onChange({ x: Math.round(x), y: Math.round(y) });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        handleInteraction(e);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (dragging) {
                e.preventDefault();
                handleInteraction(e);
            }
        };

        const handleMouseUp = () => {
            setDragging(false);
        };

        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging]);

    if (!imageUrl) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label>Puno de Enfoque (Focal Point)</Label>
                <div className="text-xs text-muted-foreground font-mono">
                    {value.x}% {value.y}%
                </div>
            </div>

            <div
                ref={containerRef}
                className="relative w-full aspect-video rounded-md overflow-hidden bg-muted cursor-crosshair border border-border group select-none touch-none"
                onMouseDown={handleMouseDown}
                // Also support simple click
                onClick={(e) => !dragging && handleInteraction(e)}
            >
                <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                />

                {/* Grid guidelines */}
                <div className="absolute inset-0 grid grid-cols-3 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="border-r border-white/50" />
                    <div className="border-r border-white/50" />
                    <div />
                    <div className="border-t border-r border-white/50 col-span-3 row-start-2" />
                    <div className="border-t border-white/50 col-span-3 row-start-3" />
                </div>

                {/* The Focal Point Dot */}
                <div
                    className="absolute w-5 h-5 rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
                    style={{
                        left: `${value.x}%`,
                        top: `${value.y}%`,
                        backgroundColor: dragging ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)'
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-1 bg-red-500 rounded-full" />
                    </div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Haz clic o arrastra el punto rojo hacia la cara o el elemento más importante de la imagen.
            </p>
        </div>
    );
}
