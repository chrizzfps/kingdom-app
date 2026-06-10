import { useState, useEffect } from 'react';

export function useColumnResize(key: string, defaultWidths: Record<string, number>) {
    const [columnWidths, setColumnWidths] = useState(() => {
        const saved = localStorage.getItem(`col-width-${key}`);
        return saved ? JSON.parse(saved) : defaultWidths;
    });

    const createResizeHandler = (colKey: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.pageX;
        const startWidth = columnWidths[colKey];

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const currentX = moveEvent.pageX;
            const diff = currentX - startX;
            setColumnWidths((prev: any) => ({
                ...prev,
                [colKey]: Math.max(50, startWidth + diff) // Min width 50px
            }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        localStorage.setItem(`col-width-${key}`, JSON.stringify(columnWidths));
    }, [columnWidths, key]);

    return { columnWidths, createResizeHandler };
}
