import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { InvoiceForm } from '@/components/finance/editor/InvoiceForm';
import { InvoiceSummary } from '@/components/finance/editor/InvoiceSummary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download, Loader2 } from 'lucide-react';
import { getInvoice, createInvoice, updateInvoice, getClients, getAgencySettings } from '@/api/crm';
import { PdfService } from '@/api/pdfService';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import type { Invoice, Client, AgencySettings } from '@/types/crm';

export default function InvoiceEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Auxiliary Data State
    const [clients, setClients] = useState<Client[]>([]);
    const [settings, setSettings] = useState<AgencySettings | null>(null);

    const methods = useForm<Invoice>({
        defaultValues: {
            number: 'INV-' + Date.now().toString().slice(-6),
            date: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'draft',
            currency: 'EUR',
            taxRate: 21,
            discount: 0,
            items: [{ id: '1', description: '', quantity: 1, price: 0, total: 0 }],
            notes: '',
        }
    });

    const { reset, watch, handleSubmit } = methods;

    // Load Data
    useEffect(() => {
        const load = async () => {
            try {
                const [c, s] = await Promise.all([getClients(), getAgencySettings()]);
                setClients(c);
                setSettings(s);

                if (s && (!id || id === 'new')) {
                    // Apply defaults from settings for new invoices
                    methods.setValue('taxRate', s.defaultTaxRate || 21);
                    methods.setValue('currency', s.currency || 'EUR');
                    if (s.invoiceTerms) methods.setValue('notes', s.invoiceTerms);
                }

                if (id && id !== 'new') {
                    const inv = await getInvoice(id);
                    if (inv) {
                        reset({
                            ...inv,
                            date: inv.date instanceof Date ? inv.date : new Date(inv.date),
                            dueDate: inv.dueDate instanceof Date ? inv.dueDate : new Date(inv.dueDate),
                        });
                    }
                }
            } catch (e) {
                console.error(e);
                toast.error('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, reset, methods]);

    const handleSave = async (data: Invoice) => {
        setSaving(true);
        try {
            // Validation Logic could go here or in schema
            if (!data.clientId) {
                toast.error('Debes seleccionar un cliente');
                setSaving(false);
                return;
            }

            const invoiceData = {
                ...data,
                date: new Date(data.date),
                dueDate: new Date(data.dueDate),
            };

            if (id && id !== 'new') {
                await updateInvoice(id, invoiceData);
                toast.success('Factura actualizada');
            } else {
                const newId = await createInvoice(invoiceData);
                toast.success('Factura creada');
                navigate(`/admin/invoices/${newId}`);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPdf = async () => {
        const data = watch();
        const client = clients.find(c => c.id === data.clientId);

        if (!client) {
            toast.error('Selecciona un cliente para generar el PDF');
            return;
        }

        setGeneratingPdf(true);
        try {
            toast.loading('Generando PDF...', { id: 'pdf-gen' });
            const blob = await PdfService.generateInvoicePdf(data, settings, client);
            PdfService.downloadBlob(blob, `Factura-${data.number}.pdf`);
            toast.success('PDF Descargado', { id: 'pdf-gen' });
        } catch (e) {
            console.error(e);
            toast.error('Error al generar PDF', { id: 'pdf-gen' });
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleClientCreated = (newClient: Client) => {
        setClients(prev => [...prev, newClient]);
        methods.setValue('clientId', newClient.id); // Ensure selected
    };

    if (loading) return <KingdomLoader />;

    return (
        <FormProvider {...methods}>
            <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-background">
                {/* Left Panel: Form (Scrollable) - Wider */}
                <div className="w-full md:w-2/3 lg:w-3/4 h-full overflow-y-auto border-r border-border bg-background/50 backdrop-blur-sm p-6 scrollbar-none">
                    <div className="mb-6 flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/invoices')}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {id === 'new' ? 'Nueva Factura' : 'Editar Factura'}
                        </h1>
                    </div>

                    <InvoiceForm clients={clients} onClientCreated={handleClientCreated} />

                    {/* Mobile Actions (Visible only on small screens) */}
                    <div className="md:hidden mt-8 flex flex-col gap-3 pb-20">
                        <Button onClick={handleSubmit(handleSave)} disabled={saving} variant="contrast" className="w-full">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Guardar
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPdf} disabled={generatingPdf} className="w-full">
                            {generatingPdf ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                            Descargar PDF
                        </Button>
                    </div>
                </div>

                {/* Right Panel: Summary Sidebar (Fixed/Sticky) */}
                <div className="hidden md:flex flex-col w-full md:w-1/3 lg:w-1/4 h-full bg-muted/30 relative">
                    {/* Toolbar */}
                    <div className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-10">
                        <span className="text-sm font-medium text-muted-foreground">Resumen</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={generatingPdf}>
                                {generatingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                            </Button>
                            <Button size="sm" variant="contrast" onClick={handleSubmit(handleSave)} disabled={saving}>
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Summary Area */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <InvoiceSummary clients={clients} />
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}
