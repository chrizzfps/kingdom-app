import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card'; // We'll create a custom card look
import { GripVertical, Trash2, Eye, EyeOff, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProposalModule, ModuleType } from '@/types/proposal';

const MODULE_LABELS: Partial<Record<ModuleType, string>> = {
    HERO: 'Portada (Proposal)',
    INTRO: 'Introducción',
    OPTIONS: 'Opciones',
    PRICING: 'Precios',
    TIMELINE: 'Cronograma',
    PAYMENT: 'Pago',
    CTA: 'Llamada a la Acción',
    TEXT: 'Texto Libre',
    REFERENCES: 'Referencias',
    PROJECT: 'Proyecto Individual',
    PORTFOLIO_HERO: 'Portfolio Hero',
    PORTFOLIO_CTA: 'Portfolio CTA'
};

interface SortableModuleProps {
    module: ProposalModule;
    onRemove: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onEdit: (module: ProposalModule) => void;
    dirty?: boolean;
}

export function SortableModule({ module, onRemove, onToggleVisibility, onEdit, dirty }: SortableModuleProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            <Card className="bg-card/40 border-border text-card-foreground relative group hover:border-primary/30 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-[0_0_20px_-10px_rgba(0,0,0,0.3)]">
                <div className="flex items-center p-4">
                    {/* Drag Handle */}
                    <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground mr-4 transition-colors">
                        <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Content Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold tracking-wider">
                                {module.type}
                            </span>
                            <h3 className="text-sm font-medium text-foreground">
                                {MODULE_LABELS[module.type] || module.type}
                            </h3>
                            {dirty ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500">
                                    Draft
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onToggleVisibility(module.id)} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            {module.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(module)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onRemove(module.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
