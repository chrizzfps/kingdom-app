import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, getProjects, getInvoices } from '@/api/crm';
import type { Client, Project, Invoice } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { ArrowLeft, Building2, Mail, Globe, MapPin, Pencil, FolderKanban, Receipt, FileText } from 'lucide-react';
import { ClientDialog } from '@/components/crm/ClientDialog';
import { ProjectDialog } from '@/components/crm/ProjectDialog';
import { toast } from 'sonner';
import { useRole } from '@/hooks/useRole';

export default function ClientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const { isAdmin } = useRole();

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const clientData = await getClient(id);
            if (!clientData) {
                toast.error('Cliente no encontrado');
                navigate('/admin/clients');
                return;
            }
            setClient(clientData);
            const projectsData = await getProjects(id);
            setProjects(projectsData);
            const invoicesData = await getInvoices(id);
            setInvoices(invoicesData);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    if (loading) return <KingdomLoader />;
    if (!client) return null;

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto px-2 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/clients')} className="shrink-0 self-start">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
                        <span className="truncate">{client.name}</span>
                        {client.commercialName && <span className="text-sm md:text-lg font-normal text-muted-foreground">/ {client.commercialName}</span>}
                    </h2>
                </div>
                {isAdmin && (
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="shrink-0 self-start sm:self-auto">
                        <Pencil className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Editar Perfil</span>
                        <span className="sm:hidden">Editar</span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-32 w-32 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border mb-4">
                                {client.logoUrl ? (
                                    <img src={client.logoUrl} alt={client.name} className="h-full w-full object-contain p-2" />
                                ) : (
                                    <Building2 className="h-12 w-12 text-muted-foreground" />
                                )}
                            </div>
                            <h3 className="font-bold text-xl">{client.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Cliente desde {client.createdAt?.toLocaleDateString()}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Información de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{client.email}</span>
                            </div>
                            {client.website && (
                                <div className="flex items-center gap-3">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline truncate">{client.website}</a>
                                </div>
                            )}
                            {client.address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <span>{client.address}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Datos Fiscales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Razón Social</span>
                                <p className="font-medium">{client.legalName || '-'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs uppercase tracking-wider">ID Fiscal</span>
                                <p className="font-medium font-mono">{client.taxId || '-'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Dirección Fiscal</span>
                                <p className="whitespace-pre-wrap">{client.fiscalAddress || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content: Projects & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <FolderKanban className="h-5 w-5 text-brand-blue" />
                            Proyectos Activos
                        </h3>
                        <Button size="sm" variant="contrast" onClick={() => setIsProjectDialogOpen(true)}>Nuevo Proyecto</Button>
                    </div>

                    <div className="grid gap-4">
                        {projects.length > 0 ? (
                            projects.map(project => (
                                <Card key={project.id} className="hover:border-brand-blue/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/projects/${project.id}`)}>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-lg">{project.name}</h4>
                                            <p className="text-muted-foreground text-sm line-clamp-1">{project.description || 'Sin descripción'}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${project.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                                project.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-zinc-500/10 text-zinc-500'
                                                }`}>
                                                {project.status}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="border border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20">
                                <FolderKanban className="h-10 w-10 mb-4 opacity-50" />
                                <p>Este cliente no tiene proyectos aún.</p>
                                <Button variant="link" className="mt-2 text-brand-blue">Crear el primer proyecto</Button>
                            </div>
                        )}
                    </div>

                    {/* Billing History - Admin Only */}
                    {isAdmin && (
                        <>
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-brand-blue" />
                                    Historial de Facturación
                                </h3>
                                <Button size="sm" variant="contrast" onClick={() => navigate('/admin/invoices/new')}>Nueva Factura</Button>
                            </div>

                            <div className="grid gap-4">
                                {invoices.length > 0 ? (
                                    invoices.map(invoice => (
                                        <Card key={invoice.id} className="hover:border-brand-blue/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/invoices/${invoice.id}`)}>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold flex items-center gap-2">
                                                            {invoice.number}
                                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                                                invoice.status === 'sent' ? 'bg-blue-500/10 text-blue-500' :
                                                                    invoice.status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                                                                        'bg-zinc-500/10 text-zinc-500'
                                                                }`}>{invoice.status}</span>
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">{invoice.date?.toLocaleDateString()} — Vence: {invoice.dueDate?.toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">
                                                        {new Intl.NumberFormat('es-US', { style: 'currency', currency: invoice.currency }).format(invoice.total)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Total</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20">
                                        <Receipt className="h-8 w-8 mb-3 opacity-50" />
                                        <p>No hay facturas registradas.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ClientDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                client={client}
                onSuccess={loadData}
            />

            <ProjectDialog
                open={isProjectDialogOpen}
                onOpenChange={setIsProjectDialogOpen}
                clients={[client]} // Pass only current client to restrict selection/default
                project={{ clientId: client.id } as any} // Pre-populate client
                onSuccess={loadData}
            />
        </div >
    );
}
