import { useState, useEffect, useMemo } from 'react';
import { getInvoices, getClients, deleteInvoice, getAgencySettings } from '@/api/crm';
import type { Invoice, Client, AgencySettings } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, FileText, Trash2, Copy, Filter, X, Download, Loader2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { PdfService } from '@/api/pdfService';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type StatusFilter = 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

import { InvoiceStats } from '@/components/finance/dashboard/InvoiceStats';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [settings, setSettings] = useState<AgencySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [clientFilter, setClientFilter] = useState<string>('all');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        // Don't load if user is not authenticated
        if (!user) {
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const [invData, clientData, settingsData] = await Promise.all([getInvoices(), getClients(), getAgencySettings()]);
                setInvoices(invData);
                setClients(clientData);
                setSettings(settingsData);
            } catch (error: any) {
                console.error(error);
                // Check if it's a permissions error
                if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
                    toast.error('No tienes permisos para ver las facturas. Por favor, inicia sesión.');
                    navigate('/login');
                } else {
                    toast.error('Error al cargar facturas');
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user, navigate]);

    // Stats handled by InvoiceStats component

    // Filter invoices
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            // Search filter
            const matchesSearch =
                inv.number.toLowerCase().includes(search.toLowerCase()) ||
                clients.find(c => c.id === inv.clientId)?.name.toLowerCase().includes(search.toLowerCase()) ||
                false;

            // Status filter
            const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

            // Client filter
            const matchesClient = clientFilter === 'all' || inv.clientId === clientFilter;

            return matchesSearch && matchesStatus && matchesClient;
        });
    }, [invoices, clients, search, statusFilter, clientFilter]);

    const handleDelete = async (invoiceId: string, invoiceNumber: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la factura ${invoiceNumber}?`)) {
            return;
        }
        try {
            await deleteInvoice(invoiceId);
            setInvoices(invoices.filter(inv => inv.id !== invoiceId));
            toast.success('Factura eliminada');
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar la factura');
        }
    };

    const handleDuplicate = (invoice: Invoice) => {
        navigate(`/admin/invoices/new`, {
            state: {
                duplicate: {
                    ...invoice,
                    number: `INV-${Date.now().toString().slice(-6)}`,
                    status: 'draft',
                    date: new Date(),
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                }
            }
        });
    };

    const handleDownload = async (invoice: Invoice) => {
        const client = clients.find(c => c.id === invoice.clientId);
        if (!client) {
            toast.error('Cliente no encontrado');
            return;
        }

        setDownloadingId(invoice.id);
        try {
            toast.loading('Generando PDF...', { id: 'pdf-download-' + invoice.id });
            const blob = await PdfService.generateInvoicePdf(invoice, settings, client);
            PdfService.downloadBlob(blob, `Factura-${invoice.number}.pdf`);
            toast.success('PDF descargado', { id: 'pdf-download-' + invoice.id });
        } catch (error) {
            console.error(error);
            toast.error('Error al descargar PDF', { id: 'pdf-download-' + invoice.id });
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) return <KingdomLoader />;

    return (
        <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500 px-2 md:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight">Facturas</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 hidden sm:block">Gestiona todas tus facturas en un solo lugar</p>
                </div>
                <Button onClick={() => navigate('/admin/invoices/new')} variant="contrast" size="default" className="shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Factura
                </Button>
            </div>

            {/* Mobile: Filters first, then stats. Desktop: Stats first, then filters */}
            <div className="flex flex-col md:flex-col-reverse gap-4 md:gap-8">
                {/* Statistics Cards - Hidden on mobile, shown on desktop */}
                <div className="hidden md:block">
                    <InvoiceStats invoices={invoices} />
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por número, cliente..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="draft">Borrador</SelectItem>
                                    <SelectItem value="sent">Enviada</SelectItem>
                                    <SelectItem value="paid">Pagada</SelectItem>
                                    <SelectItem value="overdue">Vencida</SelectItem>
                                    <SelectItem value="cancelled">Cancelada</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={clientFilter} onValueChange={setClientFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los clientes</SelectItem>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {(search || statusFilter !== 'all' || clientFilter !== 'all') && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        setStatusFilter('all');
                                        setClientFilter('all');
                                    }}
                                >
                                    <X className="h-4 w-4 mr-2" /> Limpiar
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices List */}
                <Card>
                    <CardHeader className="py-3 md:py-6">
                        <CardTitle className="text-sm md:text-base">
                            {filteredInvoices.length} factura{filteredInvoices.length !== 1 ? 's' : ''}
                            {filteredInvoices.length !== invoices.length && ` de ${invoices.length} total`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 md:px-6 pb-4 md:pb-6">
                        {/* Mobile Card Layout */}
                        <div className="md:hidden space-y-3">
                            {filteredInvoices.map((invoice) => {
                                const client = clients.find(c => c.id === invoice.clientId);
                                const isOverdue = invoice.status === 'overdue' ||
                                    (invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid');

                                return (
                                    <div
                                        key={invoice.id}
                                        className={`p-4 rounded-lg border border-border bg-card cursor-pointer ${isOverdue ? 'border-red-500/30 bg-red-50/30 dark:bg-red-950/10' : ''}`}
                                        onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <span className="font-mono font-semibold text-sm text-foreground">{invoice.number}</span>
                                                <span className="text-xs text-muted-foreground block truncate mt-0.5">{client?.name || 'Desconocido'}</span>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                                invoice.status === 'sent' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                                    invoice.status === 'overdue' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                                        invoice.status === 'draft' ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400' :
                                                            'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                                }`}>
                                                {invoice.status === 'paid' ? 'Pagada' :
                                                    invoice.status === 'sent' ? 'Enviada' :
                                                        invoice.status === 'overdue' ? 'Vencida' :
                                                            invoice.status === 'draft' ? 'Borrador' : 'Cancelada'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-muted-foreground">
                                                <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                                                    Vence: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-ES') : '-'}
                                                </span>
                                            </div>
                                            <div className="font-bold text-foreground">
                                                {new Intl.NumberFormat('es-ES', {
                                                    style: 'currency',
                                                    currency: invoice.currency || 'EUR'
                                                }).format(invoice.total || 0)}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleDownload(invoice)} disabled={downloadingId === invoice.id}>
                                                {downloadingId === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleDuplicate(invoice)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(invoice.id, invoice.number)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredInvoices.length === 0 && (
                                <div className="py-12 text-center text-muted-foreground">
                                    {search || statusFilter !== 'all' || clientFilter !== 'all'
                                        ? 'No se encontraron facturas con los filtros aplicados.'
                                        : 'No hay facturas. Crea tu primera factura para comenzar.'}
                                </div>
                            )}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="rounded-md border border-border overflow-hidden hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Número</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Vencimiento</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-[100px] text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInvoices.map((invoice) => {
                                        const client = clients.find(c => c.id === invoice.clientId);
                                        const isOverdue = invoice.status === 'overdue' ||
                                            (invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid');

                                        return (
                                            <TableRow
                                                key={invoice.id}
                                                className={`hover:bg-muted/50 ${isOverdue ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}
                                            >
                                                <TableCell
                                                    className="font-medium font-mono cursor-pointer"
                                                    onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                                                >
                                                    {invoice.number}
                                                </TableCell>
                                                <TableCell
                                                    className="cursor-pointer"
                                                    onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                                                >
                                                    {client?.name || 'Desconocido'}
                                                </TableCell>
                                                <TableCell
                                                    className="cursor-pointer"
                                                    onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                                                >
                                                    {invoice.date ? new Date(invoice.date).toLocaleDateString('es-ES') : '-'}
                                                </TableCell>
                                                <TableCell
                                                    className={`cursor-pointer ${isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}
                                                    onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                                                >
                                                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-ES') : '-'}
                                                </TableCell>
                                                <TableCell
                                                    className="cursor-pointer"
                                                    onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                                                >
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                                        invoice.status === 'sent' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                                            invoice.status === 'overdue' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                                                invoice.status === 'draft' ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400' :
                                                                    'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                                        }`}>
                                                        {invoice.status === 'paid' ? 'Pagada' :
                                                            invoice.status === 'sent' ? 'Enviada' :
                                                                invoice.status === 'overdue' ? 'Vencida' :
                                                                    invoice.status === 'draft' ? 'Borrador' :
                                                                        'Cancelada'}
                                                    </span>
                                                </TableCell>
                                                <TableCell
                                                    className="text-right font-semibold cursor-pointer"
                                                    onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                                                >
                                                    {new Intl.NumberFormat('es-ES', {
                                                        style: 'currency',
                                                        currency: invoice.currency || 'EUR'
                                                    }).format(invoice.total || 0)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleDownload(invoice)} disabled={downloadingId === invoice.id}>
                                                                {downloadingId === invoice.id ? (
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                )}
                                                                Descargar PDF
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => navigate(`/admin/invoices/${invoice.id}`)}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                Ver / Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDuplicate(invoice)}>
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                Duplicar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(invoice.id, invoice.number)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredInvoices.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                {search || statusFilter !== 'all' || clientFilter !== 'all'
                                                    ? 'No se encontraron facturas con los filtros aplicados.'
                                                    : 'No hay facturas. Crea tu primera factura para comenzar.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
