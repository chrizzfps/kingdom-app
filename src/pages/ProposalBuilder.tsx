import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useProposalBuilder } from '@/hooks/useProposalBuilder';
import { getProposal, updateProposal } from '@/api/proposals';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Plus } from 'lucide-react';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableModule } from '@/components/admin/SortableModule';
import type { ModuleType } from '@/types/proposal';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ModuleRenderer } from '@/components/public/ModuleRenderer';
import { validateProposal } from '@/lib/validate';
import { ModuleEditor } from '@/components/admin/editors/ModuleEditor';
import { WhiteboardEditor } from '@/components/admin/editors/WhiteboardEditor';

export default function ProposalBuilder() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { proposal, setProposal, attachModulesListener, addModule, removeModule, reorderModules, toggleModuleVisibility, updateModule, updateProposalField } = useProposalBuilder();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [opLoading, setOpLoading] = useState(false);
    const [publishOpen, setPublishOpen] = useState(false);
    const [issues, setIssues] = useState<any[]>([]);
    const autosaveTimer = useRef<any>(null);
    // We'll handle editing state later
    const [editingModule, setEditingModule] = useState<any>(null);
    const [whiteboardModule, setWhiteboardModule] = useState<any>(null);
    const [dirtyModules, setDirtyModules] = useState<Record<string, boolean>>({});
    const [pendingClose, setPendingClose] = useState(false);
    const [externalAction, setExternalAction] = useState<{ type: 'save' | 'discard' | 'none'; token?: number }>({ type: 'none' });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (id) {
            getProposal(id).then(data => {
                if (data) {
                    setProposal(data);
                    const unsubscribe = attachModulesListener(data.id);
                    autosaveTimer.current = unsubscribe;
                }
                setLoading(false);
            });
        }
    }, [id, setProposal, attachModulesListener]);

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        await updateProposal(id, proposal);
        setSaving(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            reorderModules(active.id as string, over?.id as string);
        }
    };

    const moduleTypes: ModuleType[] = proposal.type === 'portfolio'
        ? ['PORTFOLIO_HERO', 'INTRO', 'PROJECT', 'PORTFOLIO_CTA', 'TEXT', 'WHITEBOARD']
        : ['HERO', 'INTRO', 'OPTIONS', 'PRICING', 'TIMELINE', 'PAYMENT', 'CTA', 'TEXT', 'REFERENCES', 'WHITEBOARD'];

    useEffect(() => {
        return () => {
            if (typeof autosaveTimer.current === 'function') {
                autosaveTimer.current();
            }
        };
    }, []);

    const handleDirtyChange = useCallback((id: string, d: boolean) => {
        setDirtyModules((prev) => ({ ...prev, [id]: d }));
    }, []);

    if (loading) return <KingdomLoader />;


    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-background selection:bg-brand-blue selection:text-white">
            <div className="flex items-center justify-between p-4 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(proposal.type === 'portfolio' ? '/admin/portfolios' : '/admin/proposals')} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                    <div>
                        <h2 className="text-lg font-bold text-foreground leading-none tracking-tight">{proposal.clientName}</h2>
                        <span className="text-muted-foreground text-xs font-mono">/ {proposal.slug}</span>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <Select
                        value={proposal.status}
                        onValueChange={(val: any) => {
                            if (val === 'published') {
                                const errs = validateProposal(proposal);
                                setIssues(errs);
                                setPublishOpen(true);
                            } else {
                                updateProposalField('status', val);
                            }
                        }}
                    >
                        <SelectTrigger className="w-[140px] bg-background border-input text-foreground focus:ring-ring">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xl">
                            <SelectItem value="draft" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">Draft</SelectItem>
                            <SelectItem value="published" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">Published</SelectItem>
                            <SelectItem value="accepted" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">Accepted</SelectItem>
                            <SelectItem value="rejected" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                disabled={opLoading}
                                variant="contrast"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Module
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-background/95 backdrop-blur-md border-l border-border text-foreground sm:max-w-2xl shadow-2xl overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle className="text-foreground text-xl">Add Module</SheetTitle>
                                <SheetDescription className="text-muted-foreground">
                                    Choose a module type to add to your proposal.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid grid-cols-1 gap-3 mt-6">
                                {moduleTypes.map(type => (
                                    <Button
                                        key={type}
                                        variant="outline"
                                        className="justify-start h-12 px-4 border-border bg-card text-foreground hover:bg-accent hover:text-primary transition-all group backdrop-blur-sm shadow-sm"
                                        onClick={async () => { setOpLoading(true); await addModule(type); setOpLoading(false); }}
                                    >
                                        <span className="font-semibold group-hover:translate-x-1 transition-transform">{type}</span>
                                    </Button>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Button onClick={handleSave} disabled={saving} variant="contrast">
                        <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Builder Canvas */}
            <div className="flex-1 overflow-hidden flex relative">
                {/* Main Area */}
                <div className="flex-1 bg-background overflow-y-auto custom-scrollbar">
                    <div className="max-w-4xl mx-auto py-12 px-8 min-h-full">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={proposal.modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-4">
                                    {proposal.modules.map(module => (
                                        <SortableModule
                                            key={module.id}
                                            module={module}
                                            onRemove={removeModule}
                                            onToggleVisibility={toggleModuleVisibility}
                                            onEdit={(mod) => {
                                                if (mod.type === 'WHITEBOARD') {
                                                    setWhiteboardModule(mod);
                                                } else {
                                                    setEditingModule(mod);
                                                }
                                            }}
                                            dirty={!!dirtyModules[module.id]}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {proposal.modules.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border rounded-2xl bg-card/50 text-center group cursor-default">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Plus className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No modules yet</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                                    Start building your proposal by adding a Hero section or other modules from the top bar.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Editor Side Panel (Conditional for now, or use Sheet) */}
            {/* We will implement the Module Editor Sheet in the next step */}
            {/* Editor Side Panel */}
            {/* Editor Side Panel */}
            <Sheet
                open={!!editingModule}
                onOpenChange={(open) => {
                    if (open) return;
                    if (editingModule && dirtyModules[editingModule.id]) {
                        setPendingClose(true);
                        return;
                    }
                    setEditingModule(null);
                }}
            >
                <SheetContent className="w-full sm:max-w-[50vw] sm:w-[50vw] bg-background/95 backdrop-blur-xl border-l border-border text-foreground overflow-y-auto shadow-2xl">
                    {/* Find the live module from the proposal state to ensure we have the latest data */}
                    {(() => {
                        const activeModule = proposal.modules.find(m => m.id === editingModule?.id);
                        if (!activeModule) return null;

                        return (
                            <>
                                <SheetHeader className="pb-6 border-b border-border">
                                    <SheetTitle className="text-2xl font-bold text-foreground">Edit {activeModule.type}</SheetTitle>
                                    <SheetDescription className="text-muted-foreground/80">
                                        Customize the content and behavior of this module.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="mt-8 space-y-6">
                                    <ModuleEditor
                                        module={activeModule}
                                        onUpdate={updateModule}
                                        onDirtyChange={handleDirtyChange}
                                        externalAction={externalAction}
                                        onAfterAction={(type) => {
                                            setExternalAction({ type: 'none' });
                                            if (type === 'save' || type === 'discard') {
                                                setPendingClose(false);
                                                setEditingModule(null);
                                            }
                                        }}
                                        allModules={proposal.modules}
                                    />
                                </div>
                            </>
                        );
                    })()}
                </SheetContent>
            </Sheet>
            <Dialog open={pendingClose} onOpenChange={setPendingClose}>
                <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-white/10">
                    <DialogHeader>
                        <DialogTitle>Cambios sin guardar</DialogTitle>
                        <DialogDescription>¿Deseas guardar, descartar o continuar editando?</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setPendingClose(false)}>Seguir editando</Button>
                        <Button variant="outline" onClick={() => setExternalAction({ type: 'discard', token: Date.now() })}>Descartar</Button>
                        <Button variant="contrast" onClick={() => setExternalAction({ type: 'save', token: Date.now() })}>Guardar y cerrar</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
                <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border-white/10">
                    <DialogHeader>
                        <DialogTitle>Previsualización antes de publicar</DialogTitle>
                        <DialogDescription>Revisa los módulos y corrige cualquier problema detectado.</DialogDescription>
                    </DialogHeader>
                    {issues.length ? (
                        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {issues.map((i, idx) => (
                                <div key={idx}>• {i.message}</div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-brand-cyan">Todo OK para publicar</div>
                    )}
                    <div className="max-h-[50vh] overflow-auto rounded-lg border border-white/10">
                        {proposal.modules.map((m) => (
                            <ModuleRenderer key={m.id} module={m} />
                        ))}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setPublishOpen(false)}>Cerrar</Button>
                        <Button
                            variant="contrast"
                            className="font-bold"
                            disabled={issues.length > 0}
                            onClick={() => {
                                updateProposalField('status', 'published');
                                setPublishOpen(false);
                            }}
                        >
                            Publicar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Whiteboard full-screen portal — lives completely outside Sheet/Radix ── */}
            {whiteboardModule && createPortal(
                <div className="fixed inset-0 z-[9999] flex flex-col bg-zinc-950">
                    <WhiteboardEditor
                        module={proposal.modules.find(m => m.id === whiteboardModule.id) ?? whiteboardModule}
                        onUpdate={(data) => updateModule(whiteboardModule.id, data)}
                        onClose={() => setWhiteboardModule(null)}
                    />
                </div>,
                document.body
            )}
        </div>
    );
}
