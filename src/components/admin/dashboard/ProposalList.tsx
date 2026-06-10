import type { Proposal } from '@/types/proposal';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2, Layout, Calendar, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProposalListProps {
    items: Proposal[];
    onDelete: (id: string) => void;
}

export function ProposalList({ items, onDelete }: ProposalListProps) {
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="text-center py-24 rounded-lg border border-dashed border-white/5 bg-white/[0.02]">
                <Archive className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-medium text-foreground">No hay items aquí</h3>
                <p className="text-muted-foreground">Crea un nuevo documento para empezar.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <Card key={item.id} className="group border-border bg-card hover:bg-muted/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={`
                                    ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        item.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                            'bg-blue-500/10 text-blue-500 border-blue-500/20'}
                                `}>
                                    {item.status.toUpperCase()}
                                </Badge>
                                {item.type === 'portfolio' && (
                                    <Badge variant="secondary" className="bg-brand-purple/10 text-brand-purple border-brand-purple/20">
                                        {item.portfolioType?.toUpperCase() || 'PORTFOLIO'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <CardTitle className="text-xl leading-tight truncate pr-2">
                            {item.clientName}
                        </CardTitle>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-4">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Sin fecha'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Layout className="h-3 w-3" />
                                {item.modules?.length || 0} módulos
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3 px-6 h-24 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
                        <div className="text-sm text-muted-foreground line-clamp-3 opacity-60">
                            /{item.slug}
                        </div>
                        {/* Placeholder for a preview image if available in future */}
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-border bg-muted/30 flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => onDelete(item.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => window.open(item.status === 'published' ? `/p/${item.slug}` : `/preview/${item.id}`, '_blank')}
                        >
                            <Eye className="h-3.5 w-3.5" /> Ver
                        </Button>
                        <Button
                            variant="contrast"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => navigate(`/admin/builder/${item.id}`)}
                        >
                            <Edit className="h-3.5 w-3.5" /> Editar
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
