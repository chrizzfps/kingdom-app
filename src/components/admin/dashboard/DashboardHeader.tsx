import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import type { ProposalType, PortfolioType } from '@/types/proposal';

interface DashboardHeaderProps {
    onCreate: (data: { type: ProposalType; portfolioType?: PortfolioType; name: string }) => Promise<void>;
    defaultType?: ProposalType;
    title?: string;
}

export function DashboardHeader({ onCreate, defaultType = 'proposal', title }: DashboardHeaderProps) {
    const [open, setOpen] = useState(false);
    const [creationType, setCreationType] = useState<ProposalType>(defaultType);
    const [portfolioType, setPortfolioType] = useState<PortfolioType>('logo');
    const [newItemName, setNewItemName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onCreate({
            type: creationType,
            portfolioType: creationType === 'portfolio' ? portfolioType : undefined,
            name: newItemName
        });
        setLoading(false);
        setOpen(false);
        setNewItemName('');
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                {title && (
                    <>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                        <p className="text-muted-foreground mt-1">
                            Gestiona tus {defaultType === 'proposal' ? 'propuestas comerciales' : 'portafolios creativos'}.
                        </p>
                    </>
                )}
            </div>

            <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (isOpen) setCreationType(defaultType);
            }}>
                <DialogTrigger asChild>
                    <Button 
                        variant="contrast" 
                        className="shadow-lg shadow-black/10"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Crear Nuevo
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crear nuevo documento</DialogTitle>
                        <DialogDescription>
                            Elige el tipo de documento que deseas crear.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Tipo de Documento</Label>
                            <Select value={creationType} onValueChange={(v: ProposalType) => setCreationType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="proposal">Propuesta Comercial</SelectItem>
                                    <SelectItem value="portfolio">Portafolio Creativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {creationType === 'portfolio' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>Categoría de Portafolio</Label>
                                <Select value={portfolioType} onValueChange={(v: PortfolioType) => setPortfolioType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="logo">Logofolio</SelectItem>
                                        <SelectItem value="web">Web Portfolio</SelectItem>
                                        <SelectItem value="design">Graphic Design</SelectItem>
                                        <SelectItem value="photo">Photography</SelectItem>
                                        <SelectItem value="video">Videography</SelectItem>
                                        <SelectItem value="social">Social Media</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>{creationType === 'proposal' ? 'Nombre del Cliente' : 'Nombre del Portafolio'}</Label>
                            <Input
                                placeholder={creationType === 'proposal' ? "Ej. Acme Corp" : "Ej. Mi Logofolio 2024"}
                                value={newItemName}
                                onChange={e => setNewItemName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading} className="bg-brand-blue w-full">
                                {loading ? 'Creando...' : 'Crear Documento'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
