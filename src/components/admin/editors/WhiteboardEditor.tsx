import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useWhiteboardStore } from '@/store/whiteboardStore';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';
import { Toolbar } from '@/components/whiteboard/Toolbar';
import { FloatingToolbar } from '@/components/whiteboard/FloatingToolbar';
import { StylePanel } from '@/components/whiteboard/StylePanel';
import type { ProposalModule } from '@/types/proposal';
import { useUpload } from '@/hooks/useUpload';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  module: ProposalModule;
  onUpdate: (data: any) => void;
  /** When provided, shows a close button in the header (full-screen mode) */
  onClose?: () => void;
}

export function WhiteboardEditor({ module, onUpdate, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { setElements, elements, deleteSelected, duplicateSelected, clearSelection, selectedIds, addElement } = useWhiteboardStore();
  const { upload, deleteFile, loading: uploading } = useUpload();

  // ── Handle Deletion with Asset Cleanup ──────
  const handleDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    // Find images among selected elements to delete from storage
    const imagesToDelete = elements
      .filter((el) => selectedIds.includes(el.id) && el.type === 'image')
      .map((el) => (el as any).src);

    // Call storage deletion API for each image
    for (const url of imagesToDelete) {
      if (url) {
        // We don't await so the UI remains snappy, but the process starts
        deleteFile(url).catch(err => console.error('Error deleting from storage:', err));
      }
    }

    deleteSelected();
  }, [selectedIds, elements, deleteFile, deleteSelected]);

  // ── Load state from module.data.elements ─────
  useEffect(() => {
    const savedData = module.data?.elements;
    if (Array.isArray(savedData) && savedData.length > 0) {
      setElements(savedData);
    } else {
      setElements([]);
    }
    return () => { setElements([]); };
  }, [module.id, setElements]);

  // ── Resize observer ───────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(container);
    setDimensions({ width: container.clientWidth, height: container.clientHeight });
    return () => observer.disconnect();
  }, []);

  // ── Keyboard shortcuts — capture phase so ESC never propagates up ──────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) { handleDelete(); e.preventDefault(); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
      }
      // ESC clears selection only — stopPropagation prevents any parent from closing anything
      if (e.key === 'Escape') {
        e.stopPropagation();
        clearSelection();
      }
    };
    // Capture phase: intercept before Radix / Sheet listeners see the event
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [selectedIds, handleDelete, duplicateSelected, clearSelection]);

  // ── Save ──────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 120));
    onUpdate({ elements });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [elements, onUpdate]);

  // ── Image upload ──────────────────────────────
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await upload(file);
      const img = new window.Image();
      img.onload = () => {
        const maxW = 400;
        const ratio = img.naturalHeight / img.naturalWidth;
        const w = Math.min(img.naturalWidth, maxW);
        const h = w * ratio;
        addElement({
          id: uuidv4(), type: 'image', x: 100, y: 100,
          rotation: 0, opacity: 1, zIndex: 0,
          src: url, width: w, height: h,
        } as any);
      };
      img.src = url;
    } catch (_) {}
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [upload, addElement]);

  const openUpload = useCallback(() => { fileInputRef.current?.click(); }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-zinc-200 tracking-tight">Whiteboard</div>
          <div className="text-xs text-zinc-600 font-mono">
            {elements.length} elemento{elements.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {uploading && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Subiendo...</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
              saved
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
            )}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? 'Guardado' : saving ? 'Guardando…' : 'Guardar'}
          </button>

          {/* Close — only in full-screen mode */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-all text-sm"
            >
              <X className="w-4 h-4" />
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Main canvas */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden bg-zinc-950">
          <WhiteboardCanvas width={dimensions.width} height={dimensions.height} />
          <Toolbar onUploadImage={openUpload} />
          <FloatingToolbar onDelete={handleDelete} />

          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <div className="text-center space-y-2">
                <div className="text-zinc-700 text-4xl">✦</div>
                <p className="text-zinc-600 text-sm">Selecciona una herramienta y haz clic en el canvas</p>
                <p className="text-zinc-700 text-xs">Space + Drag para pan • Scroll para zoom</p>
              </div>
            </div>
          )}
        </div>

        {/* Style panel */}
        <div className="w-56 border-l border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl overflow-y-auto shrink-0">
          <StylePanel />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}
