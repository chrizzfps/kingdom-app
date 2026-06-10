import type { ProposalModule } from '@/types/proposal';
import { useEffect, useMemo, useState } from 'react';
import { EDITOR_REGISTRY } from './editorRegistry';
import { ModuleRenderer } from '@/components/public/ModuleRenderer';
import { Button } from '@/components/ui/button';

interface ModuleEditorProps {
    module: ProposalModule;
    onUpdate: (id: string, data: any) => void;
    onDirtyChange?: (id: string, dirty: boolean) => void;
    externalAction?: { type: 'save' | 'discard' | 'none'; token?: number };
    onAfterAction?: (type: 'save' | 'discard') => void;
    allModules?: ProposalModule[];
}

export function ModuleEditor({ module, onUpdate, onDirtyChange, externalAction, onAfterAction, allModules }: ModuleEditorProps) {
    const [tab, setTab] = useState<'edit' | 'preview'>('edit');
    const [draft, setDraft] = useState<any>(module.data);
    const [dirty, setDirty] = useState<boolean>(false);

    useEffect(() => {
        setDraft(module.data);
        setDirty(false);
    }, [module.id]);

    useEffect(() => {
        if (onDirtyChange) onDirtyChange(module.id, dirty);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dirty, module.id]);

    useEffect(() => {
        if (!externalAction || externalAction.type === 'none') return;
        if (externalAction.type === 'save') {
            onUpdate(module.id, draft);
            setDirty(false);
            if (onAfterAction) onAfterAction('save');
        } else if (externalAction.type === 'discard') {
            setDraft(module.data);
            setDirty(false);
            if (onAfterAction) onAfterAction('discard');
        }
    }, [externalAction]);

    const handleLocalUpdate = (data: any) => {
        if (module.type === 'PAYMENT') {
            const next = { ...(draft || {}), ...data };
            setDraft(next);
            onUpdate(module.id, next);
            setDirty(false);
            return;
        }
        setDraft((prev: any) => ({ ...prev, ...data }));
        setDirty(true);
    };

    const handleSave = () => { onUpdate(module.id, draft); setDirty(false); };
    const handleDiscard = () => { setDraft(module.data); setDirty(false); };

    const virtualModule = useMemo(() => ({ ...module, data: draft }), [module, draft]);

    // WHITEBOARD is handled at ProposalBuilder level — this is a fallback only
    if (module.type === 'WHITEBOARD') {
        return (
            <div className="rounded-xl border border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
                El editor de Whiteboard se abre en pantalla completa.<br />
                Cierra este panel y usa el botón <span className="text-foreground font-medium">✏️ Editar</span> en el módulo.
            </div>
        );
    }

    const EditorComponent = EDITOR_REGISTRY[module.type];
    const editor = EditorComponent ? (
        <EditorComponent module={virtualModule} onUpdate={handleLocalUpdate} allModules={allModules} />
    ) : (
        <div className="p-4 text-muted-foreground border border-border rounded bg-card/50">
            Editor para {module.type} no implementado.
            <pre className="text-xs mt-2 overflow-auto bg-card p-2 rounded">
                {JSON.stringify(draft, null, 2)}
            </pre>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setTab('edit')}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${tab === 'edit' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Editar
                </button>
                <button
                    type="button"
                    onClick={() => setTab('preview')}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${tab === 'preview' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Previsualizar
                </button>
            </div>

            {tab === 'edit' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                            {dirty ? 'Cambios sin guardar' : 'Sin cambios pendientes'}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleDiscard} disabled={!dirty}>Descartar cambios</Button>
                            <Button variant="contrast" className="font-bold" onClick={handleSave} disabled={!dirty}>Guardar cambios</Button>
                        </div>
                    </div>
                    {editor}
                </div>
            )}

            {tab === 'preview' && (
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">Previsualización</div>
                    <div className="max-h-[70vh] overflow-auto">
                        <ModuleRenderer module={{ ...module, isVisible: true }} />
                    </div>
                </div>
            )}
        </div>
    );
}
