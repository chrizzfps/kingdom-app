import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients, deleteClient } from '@/api/crm';
import type { Client } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, Pencil, Trash, Building2, Globe, Mail } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClientDialog } from '@/components/crm/ClientDialog';
import { toast } from 'sonner';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { useRole } from '@/hooks/useRole';

export default function ClientsPage() {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const { isAdmin } = useRole();

    const loadClients = async () => {
        setLoading(true);
        try {
            const [data] = await Promise.all([
                getClients(),
                new Promise(resolve => setTimeout(resolve, 800))
            ]);
            setClients(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleDelete = async (client: Client) => {
        if (!confirm(`¿Estás seguro de eliminar a ${client.name}? Esto no se puede deshacer.`)) return;
        try {
            await deleteClient(client.id);
            toast.success('Cliente eliminado');
            loadClients();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && clients.length === 0) return <KingdomLoader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                </div>
                {isAdmin && (
                    <Button onClick={() => { setSelectedClient(null); setIsDialogOpen(true); }} variant="contrast">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map(client => (
                    <div
                        key={client.id}
                        className="group relative bg-card hover:bg-muted/30 border border-border rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:border-brand-blue/20 cursor-pointer"
                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                                    {client.logoUrl ? (
                                        <img src={client.logoUrl} alt={client.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Building2 className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg leading-none">{client.name}</h3>
                                    </div>
                                    {client.commercialName && <p className="text-xs text-muted-foreground mt-1">{client.commercialName}</p>}
                                </div>
                            </div>
                            {isAdmin && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedClient(client); setIsDialogOpen(true); }}>
                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(client); }}>
                                            <Trash className="mr-2 h-4 w-4" /> Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate">{client.email}</span>
                            </div>
                            {client.website && (
                                <div className="flex items-center gap-2">
                                    <Globe className="h-3.5 w-3.5" />
                                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue truncate" onClick={(e) => e.stopPropagation()}>{client.website}</a>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                            <span>ID: ...{client.id.slice(-4)}</span>
                            {client.taxId && <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{client.taxId}</span>}
                        </div>
                    </div>
                ))}

                {filteredClients.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        <p>No se encontraron clientes.</p>
                    </div>
                )}
            </div>

            <ClientDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                client={selectedClient}
                onSuccess={loadClients}
            />
        </div>
    );
}
