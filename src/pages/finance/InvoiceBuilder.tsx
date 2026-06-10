import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { getInvoice, createInvoice, updateInvoice, getClients, getProjects, getAgencySettings } from '@/api/crm';
import type { Invoice, Client, Project, AgencySettings } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Save, Download } from 'lucide-react';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { toast } from 'sonner';
import { PdfService } from '@/api/pdfService';

// Helper to format currency
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency || 'EUR' }).format(amount || 0);
};

export default function InvoiceBuilder() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [settings, setSettings] = useState<AgencySettings | null>(null);

    const { register, control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<Invoice>({
        defaultValues: {
            number: 'INV-' + Date.now().toString().slice(-6),
            date: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
            status: 'draft',
            currency: 'EUR',
            taxRate: 21,
            items: [{ id: '1', description: 'Servicios Profesionales', quantity: 1, price: 0, total: 0, }],
            discount: 0
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    // Watch items to calculate totals
    const items = watch('items');
    const taxRate = watch('taxRate');
    const discount = watch('discount') || 0;
    const selectedClientId = watch('clientId');
    const selectedCurrency = watch('currency');

    // Load Data
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [clientsData, projectsData, settingsData] = await Promise.all([getClients(), getProjects(), getAgencySettings()]);
                setClients(clientsData);
                setProjects(projectsData);
                setSettings(settingsData);

                // Pre-fill from URL params
                const projectId = searchParams.get('projectId');
                const clientId = searchParams.get('clientId');

                if (clientId) {
                    setValue('clientId', clientId);
                }
                if (projectId) {
                    setValue('projectId', projectId);
                }

                if (settingsData) {
                    if (!id || id === 'new') {
                        setValue('currency', settingsData.currency);
                        setValue('taxRate', settingsData.defaultTaxRate);
                    }
                }

                if (id && id !== 'new') {
                    const invoiceData = await getInvoice(id);
                    if (invoiceData) {
                        // Ensure dates are Date objects
                        setValue('number', invoiceData.number);
                        setValue('clientId', invoiceData.clientId);
                        setValue('projectId', invoiceData.projectId);
                        setValue('items', invoiceData.items);
                        setValue('status', invoiceData.status);
                        setValue('taxRate', invoiceData.taxRate);
                        setValue('notes', invoiceData.notes);
                        setValue('date', invoiceData.date instanceof Date ? invoiceData.date : new Date(invoiceData.date));
                        setValue('dueDate', invoiceData.dueDate instanceof Date ? invoiceData.dueDate : new Date(invoiceData.dueDate));
                        setValue('currency', invoiceData.currency);
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error('Error cargando datos');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, setValue, searchParams]);

    // Filter projects by client
    useEffect(() => {
        if (selectedClientId) {
            setFilteredProjects(projects.filter(p => p.clientId === selectedClientId));
        } else {
            setFilteredProjects([]);
        }
    }, [selectedClientId, projects]);

    // Calculate Totals Effect
    useEffect(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const taxableAmount = Math.max(0, subtotal - discount);
        const taxAmount = taxableAmount * (taxRate / 100);
        const total = taxableAmount + taxAmount;

        setValue('subtotal', subtotal);
        setValue('taxAmount', taxAmount);
        setValue('total', total);

        // Also update individual item totals in the form state if needed (though UI calculates it)
        items.forEach((item, index) => {
            setValue(`items.${index}.total`, item.quantity * item.price);
        });

    }, [items, taxRate, discount, setValue]);


    const generatePDF = async () => {
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) {
            toast.error('Cliente no encontrado');
            return;
        }

        setGeneratingPdf(true);
        try {
            toast.loading('Generando PDF...', { id: 'pdf-generation' });

            // Fix: ensure dates are properly formatted/typed if needed by service, 
            // but PdfService handles Date objects now.
            const blob = await PdfService.generateInvoicePdf(watch(), settings, client);
            PdfService.downloadBlob(blob, `Factura-${watch('number') || 'Borrador'}.pdf`);

            toast.success('PDF generado y descargado', { id: 'pdf-generation' });
        } catch (e) {
            console.error(e);
            toast.error('Error al generar PDF. Intenta nuevamente.', { id: 'pdf-generation' });
        } finally {
            setGeneratingPdf(false);
        }
    };

    const onSubmit = async (data: Invoice) => {
        try {
            // Validate required fields
            if (!data.clientId) {
                toast.error('Por favor selecciona un cliente');
                return;
            }
            if (!data.items || data.items.length === 0 || data.items.every(item => !item.description || item.price === 0)) {
                toast.error('Por favor agrega al menos un concepto válido');
                return;
            }

            // Ensure dates are Date objects
            const invoiceData: Invoice = {
                ...data,
                date: data.date instanceof Date ? data.date : new Date(data.date),
                dueDate: data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate),
            };

            if (id && id !== 'new') {
                await updateInvoice(id, invoiceData);
                toast.success('Factura actualizada correctamente');
                navigate(`/admin/invoices/${id}`);
            } else {
                const newId = await createInvoice(invoiceData);
                toast.success('Factura creada correctamente');
                navigate(`/admin/invoices/${newId}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar la factura');
        }
    };

    if (loading) return <KingdomLoader />;



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b border-border/50">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/admin/finance')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    {settings?.logoUrl && (
                        <div className="h-10 w-10 shrink-0 bg-muted rounded-lg border border-border/50 flex items-center justify-center p-1.5 overflow-hidden">
                            <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Editor de Facturas</h2>
                        <p className="text-sm text-muted-foreground">{id === 'new' ? 'Nueva Factura' : 'Editando Factura'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={generatePDF}
                        disabled={generatingPdf || !watch('clientId')}
                    >
                        {generatingPdf ? (
                            <>Generando...</>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" /> Descargar PDF
                            </>
                        )}
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-brand-gold text-black hover:bg-brand-gold/90">
                        <Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Cliente *</Label>
                                    <Select onValueChange={(v) => setValue('clientId', v)} value={watch('clientId')}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar Cliente" /></SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Proyecto (Opcional)</Label>
                                    <Select onValueChange={(v) => setValue('projectId', v)} value={watch('projectId')} disabled={!selectedClientId}>
                                        <SelectTrigger><SelectValue placeholder={selectedClientId ? "Seleccionar Proyecto" : "Primero selecciona un cliente"} /></SelectTrigger>
                                        <SelectContent>
                                            {filteredProjects.length > 0 ? (
                                                filteredProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                                            ) : selectedClientId ? (
                                                <div className="px-2 py-1.5 text-sm text-muted-foreground">No hay proyectos disponibles</div>
                                            ) : null}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Número de Factura *</Label>
                                    <Input {...register('number', { required: true })} placeholder="INV-000001" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Moneda *</Label>
                                    <Select onValueChange={(v) => setValue('currency', v)} value={watch('currency')}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar moneda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                            <SelectItem value="MXN">MXN ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Select onValueChange={(v: any) => setValue('status', v)} value={watch('status')}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Borrador</SelectItem>
                                            <SelectItem value="sent">Enviada</SelectItem>
                                            <SelectItem value="paid">Pagada</SelectItem>
                                            <SelectItem value="overdue">Vencida</SelectItem>
                                            <SelectItem value="cancelled">Cancelada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Items</CardTitle>
                            <Button type="button" variant="ghost" size="sm" onClick={() => append({ id: Date.now().toString(), description: '', quantity: 1, price: 0, total: 0 })}>
                                <Plus className="h-4 w-4 mr-2" /> Añadir
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No hay conceptos agregados</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={() => append({ id: Date.now().toString(), description: '', quantity: 1, price: 0, total: 0 })}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Agregar Primer Concepto
                                    </Button>
                                </div>
                            ) : (
                                fields.map((field, index) => {
                                    const itemQty = watch(`items.${index}.quantity`) || 0;
                                    const itemPrice = watch(`items.${index}.price`) || 0;
                                    const itemTotal = itemQty * itemPrice;
                                    return (
                                        <div key={field.id} className="grid grid-cols-12 gap-3 items-end border-b border-border pb-4 last:border-0">
                                            <div className="col-span-5 space-y-2">
                                                <Label className={index > 0 ? 'sr-only' : ''}>Descripción *</Label>
                                                <Input
                                                    {...register(`items.${index}.description`, { required: true })}
                                                    placeholder="Descripción del servicio o producto"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <Label className={index > 0 ? 'sr-only' : ''}>Cantidad</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    {...register(`items.${index}.quantity`, { valueAsNumber: true, min: 0 })}
                                                    className="text-center"
                                                />
                                            </div>
                                            <div className="col-span-3 space-y-2">
                                                <Label className={index > 0 ? 'sr-only' : ''}>Precio Unitario</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    {...register(`items.${index}.price`, { valueAsNumber: true, min: 0 })}
                                                    className="text-right"
                                                />
                                            </div>
                                            <div className="col-span-1 space-y-2 text-right">
                                                <Label className={index > 0 ? 'sr-only' : ''}>Total</Label>
                                                <div className="text-sm font-semibold pt-2">
                                                    {formatCurrency(itemTotal, selectedCurrency)}
                                                </div>
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea {...register('notes')} placeholder="Notas adicionales, términos de pago, etc." className="min-h-[100px]" />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-lg">Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>{formatCurrency(watch('subtotal') || 0, selectedCurrency)}</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">IVA %:</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        {...register('taxRate', { valueAsNumber: true })}
                                        className="w-16 h-8 text-right p-1"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground">Descuento:</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('discount', { valueAsNumber: true })}
                                    className="w-24 h-8 text-right"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Impuestos:</span>
                                <span>{formatCurrency(watch('taxAmount') || 0, selectedCurrency)}</span>
                            </div>
                            <div className="border-t border-border pt-4 mt-4 flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>{formatCurrency(watch('total') || 0, selectedCurrency)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Fechas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Fecha de Emisión</Label>
                                <Input type="date" {...register('date', { valueAsDate: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Vencimiento</Label>
                                <Input type="date" {...register('dueDate', { valueAsDate: true })} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </form>
    );
}

