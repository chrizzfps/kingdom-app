import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { getClients, getProjects, getAgencySettings, createInvoice, updateInvoice, getInvoice } from '@/api/crm';
import type { Invoice, Client, Project, AgencySettings } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Plus, Trash2, Save, Check, Printer, FileText, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { PdfService } from '@/api/pdfService';
import { KingdomLoader } from '@/components/ui/KingdomLoader';

const STEPS = [
    { id: 'client', title: 'Cliente', icon: User },
    { id: 'details', title: 'Detalles', icon: FileText },
    { id: 'items', title: 'Conceptos', icon: Plus },
    { id: 'review', title: 'Revisar', icon: Check }
];

export default function InvoiceWizard() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Data State
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [settings, setSettings] = useState<AgencySettings | null>(null);

    const { register, control, handleSubmit, watch, setValue } = useForm<Invoice>({
        defaultValues: {
            number: 'INV-' + Date.now().toString().slice(-6),
            date: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'draft',
            currency: 'EUR',
            taxRate: 21,
            discount: 0,
            items: [{ id: '1', description: '', quantity: 1, price: 0, total: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    // Watchers
    const formData = watch();
    const selectedClientId = watch('clientId');
    const items = watch('items');
    const taxRate = watch('taxRate');
    const discount = watch('discount') || 0;
    const [searchParams] = useSearchParams();

    // Init - Load data
    useEffect(() => {
        const init = async () => {
            try {
                const [c, p, s] = await Promise.all([getClients(), getProjects(), getAgencySettings()]);
                setClients(c);
                setProjects(p);
                setSettings(s);

                // Pre-fill from URL params
                const projectId = searchParams.get('projectId');
                const clientId = searchParams.get('clientId');

                if (clientId) {
                    setValue('clientId', clientId);
                }
                if (projectId) {
                    setValue('projectId', projectId);
                }

                if (s && (!id || id === 'new')) {
                    setValue('currency', s.currency);
                    setValue('taxRate', s.defaultTaxRate);
                }

                // Handle duplicate from location state
                const duplicateInvoice = (location.state as any)?.duplicate;
                if (duplicateInvoice) {
                    setValue('number', duplicateInvoice.number);
                    setValue('clientId', duplicateInvoice.clientId);
                    setValue('projectId', duplicateInvoice.projectId);
                    setValue('date', duplicateInvoice.date instanceof Date ? duplicateInvoice.date : new Date(duplicateInvoice.date));
                    setValue('dueDate', duplicateInvoice.dueDate instanceof Date ? duplicateInvoice.dueDate : new Date(duplicateInvoice.dueDate));
                    setValue('status', duplicateInvoice.status);
                    setValue('currency', duplicateInvoice.currency);
                    setValue('currency', duplicateInvoice.currency);
                    setValue('taxRate', duplicateInvoice.taxRate);
                    setValue('discount', duplicateInvoice.discount);
                    setValue('items', duplicateInvoice.items);
                    setValue('notes', duplicateInvoice.notes);
                } else if (id && id !== 'new') {
                    const inv = await getInvoice(id);
                    if (inv) {
                        // Populate form with proper date handling
                        setValue('number', inv.number);
                        setValue('clientId', inv.clientId);
                        setValue('projectId', inv.projectId);
                        setValue('date', inv.date instanceof Date ? inv.date : new Date(inv.date));
                        setValue('dueDate', inv.dueDate instanceof Date ? inv.dueDate : new Date(inv.dueDate));
                        setValue('status', inv.status);
                        setValue('currency', inv.currency);
                        setValue('taxRate', inv.taxRate);
                        setValue('discount', inv.discount);
                        setValue('items', inv.items);
                        setValue('notes', inv.notes);
                    }
                }
            } catch (e) {
                console.error(e);
                toast.error('Error al iniciar el asistente');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, setValue, searchParams]);

    // Filter projects by client
    useEffect(() => {
        if (selectedClientId) {
            setFilteredProjects(projects.filter(p => p.clientId === selectedClientId));
        } else {
            setFilteredProjects([]);
        }
    }, [selectedClientId, projects]);

    // Calculate totals
    useEffect(() => {
        const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const taxableAmount = Math.max(0, subtotal - discount);
        const tax = taxableAmount * (taxRate / 100);
        setValue('subtotal', subtotal);
        setValue('taxAmount', tax);
        setValue('total', taxableAmount + tax);

        // Update individual item totals
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
            const blob = await PdfService.generateInvoicePdf(watch(), settings, client);
            PdfService.downloadBlob(blob, `Factura-${formData.number || 'Borrador'}.pdf`);
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
                setStep(0);
                return;
            }
            if (!data.items || data.items.length === 0 || data.items.every(item => !item.description || item.price === 0)) {
                toast.error('Por favor agrega al menos un concepto válido');
                setStep(2);
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
        } catch (e) {
            console.error(e);
            toast.error('Error al guardar la factura');
        }
    };

    if (loading) return <KingdomLoader />;

    const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Wizard Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {settings?.logoUrl && (
                        <div className="h-12 w-12 shrink-0 bg-muted rounded-xl border border-border/50 flex items-center justify-center p-2 overflow-hidden shadow-sm">
                            <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Nueva Factura</h2>
                        <p className="text-muted-foreground">Sigue los pasos para generar una factura profesional.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/admin/invoices')}>Cancelar</Button>
                </div>
            </div>

            {/* Steps Indicator */}
            <div className="relative flex justify-between w-full max-w-3xl mx-auto mb-12">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10" />
                {STEPS.map((s, i) => (
                    <div key={s.id} className={`flex flex-col items-center gap-2 bg-background px-4 ${i <= step ? 'text-brand-blue' : 'text-muted-foreground'}`}>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${i <= step ? 'border-brand-blue bg-brand-blue/10' : 'border-border bg-muted'}`}>
                            <s.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wider">{s.title}</span>
                    </div>
                ))}
            </div>

            {/* Wizard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {step === 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Selección de Cliente</CardTitle>
                                <CardDescription>Elige a quién va dirigida esta factura.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Cliente</Label>
                                    <Select onValueChange={(v) => setValue('clientId', v)} defaultValue={watch('clientId')}>
                                        <SelectTrigger className="h-12"><SelectValue placeholder="Buscar cliente..." /></SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Proyecto Vinculado (Opcional)</Label>
                                    <Select onValueChange={(v) => setValue('projectId', v)} defaultValue={watch('projectId')} disabled={!selectedClientId}>
                                        <SelectTrigger className="h-12"><SelectValue placeholder="Seleccionar proyecto..." /></SelectTrigger>
                                        <SelectContent>
                                            {filteredProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalles de Facturación</CardTitle>
                                <CardDescription>Configura los detalles principales de la factura</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                        <Label>Fecha de Emisión *</Label>
                                        <Input
                                            type="date"
                                            {...register('date', {
                                                valueAsDate: true,
                                                required: true
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fecha de Vencimiento *</Label>
                                        <Input
                                            type="date"
                                            {...register('dueDate', {
                                                valueAsDate: true,
                                                required: true
                                            })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Select onValueChange={(v: any) => setValue('status', v)} value={watch('status')}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                                <div className="space-y-2">
                                    <Label>Notas / Términos de Pago</Label>
                                    <Textarea
                                        {...register('notes')}
                                        placeholder="Instrucciones de pago, agradecimientos, términos y condiciones..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Conceptos de Facturación</CardTitle>
                                    <CardDescription>Agrega los servicios o productos a facturar</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => append({ id: Date.now().toString(), description: '', quantity: 1, price: 0, total: 0 })}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Añadir Concepto
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
                                    <>
                                        {fields.map((field, index) => {
                                            const itemQty = watch(`items.${index}.quantity`) || 0;
                                            const itemPrice = watch(`items.${index}.price`) || 0;
                                            const itemTotal = itemQty * itemPrice;
                                            return (
                                                <div key={field.id} className="grid grid-cols-12 gap-3 items-end border-b border-border pb-4 last:border-0">
                                                    <div className="col-span-5 space-y-1">
                                                        <Label className="text-xs font-medium">Descripción *</Label>
                                                        <Input
                                                            {...register(`items.${index}.description`, { required: true })}
                                                            placeholder="Ej: Desarrollo web, Consultoría..."
                                                        />
                                                    </div>
                                                    <div className="col-span-2 space-y-1">
                                                        <Label className="text-xs font-medium">Cantidad</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            {...register(`items.${index}.quantity`, {
                                                                valueAsNumber: true,
                                                                min: 0
                                                            })}
                                                            className="text-center"
                                                        />
                                                    </div>
                                                    <div className="col-span-3 space-y-1">
                                                        <Label className="text-xs font-medium">Precio Unitario</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            {...register(`items.${index}.price`, {
                                                                valueAsNumber: true,
                                                                min: 0
                                                            })}
                                                            className="text-right"
                                                        />
                                                    </div>
                                                    <div className="col-span-1 space-y-1 text-right">
                                                        <Label className="text-xs font-medium text-muted-foreground">Total</Label>
                                                        <div className="text-sm font-semibold pt-2">
                                                            {new Intl.NumberFormat('es-ES', {
                                                                style: 'currency',
                                                                currency: formData.currency || 'EUR'
                                                            }).format(itemTotal)}
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
                                        })}
                                        <div className="flex justify-end gap-4 items-center pt-4 border-t border-border">
                                            <Label className="text-sm font-medium">Tasa de Impuestos (%):</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                {...register('taxRate', { valueAsNumber: true })}
                                                className="w-24 text-right"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-4 items-center pt-2">
                                            <Label className="text-sm font-medium">Descuento:</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                {...register('discount', { valueAsNumber: true })}
                                                className="w-24 text-right"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                </div>

                {step === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Listo para Guardar</CardTitle>
                            <CardDescription>Revisa los datos antes de finalizar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-muted rounded-md text-sm">
                                <p><strong>Cliente:</strong> {clients.find(c => c.id === selectedClientId)?.name}</p>
                                <p><strong>Factura:</strong> {formData.number}</p>
                                <p><strong>Total:</strong> {new Intl.NumberFormat('es-ES', { style: 'currency', currency: formData.currency }).format(formData.total)}</p>
                                <p className="mt-2 text-muted-foreground">Haz clic en "Descargar PDF" para previsualizar el documento final generado por el servidor.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={prevStep} disabled={step === 0}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
                    </Button>

                    {step < STEPS.length - 1 ? (
                        <Button
                            type="button"
                            onClick={() => {
                                // Validate current step before proceeding
                                if (step === 0 && !selectedClientId) {
                                    toast.error('Por favor selecciona un cliente');
                                    return;
                                }
                                if (step === 1 && !watch('number')) {
                                    toast.error('Por favor ingresa un número de factura');
                                    return;
                                }
                                if (step === 2 && (!items || items.length === 0 || items.every(item => !item.description || item.price === 0))) {
                                    toast.error('Por favor agrega al menos un concepto válido');
                                    return;
                                }
                                nextStep();
                            }}
                            className="bg-brand-blue hover:bg-brand-blue/90"
                        >
                            Siguiente <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={generatePDF} disabled={generatingPdf}>
                                <Printer className="h-4 w-4 mr-2" /> {generatingPdf ? 'Generando...' : 'Descargar PDF'}
                            </Button>
                            <Button onClick={handleSubmit(onSubmit)} className="bg-green-600 hover:bg-green-700 text-white">
                                <Save className="h-4 w-4 mr-2" /> Guardar Factura
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
                <Card className="bg-brand-dark dark:bg-brand-dark border-brand-blue/20 sticky top-6 light:bg-white light:border-border">
                    <CardHeader>
                        <CardTitle className="text-white dark:text-white light:text-foreground">Resumen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-zinc-300 dark:text-zinc-300 light:text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Cliente:</span>
                            <span className="font-medium text-white dark:text-white light:text-foreground">{clients.find(c => c.id === selectedClientId)?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Conceptos:</span>
                            <span className="font-medium text-white dark:text-white light:text-foreground">{items.length}</span>
                        </div>
                        <div className="border-t border-white/10 dark:border-white/10 light:border-border my-2" />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="text-zinc-300 dark:text-zinc-300 light:text-foreground">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: (formData.currency && formData.currency.length === 3) ? formData.currency : 'EUR' }).format(formData.subtotal || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Impuestos ({formData.taxRate || 0}%):</span>
                                <span className="text-zinc-300 dark:text-zinc-300 light:text-foreground">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: (formData.currency && formData.currency.length === 3) ? formData.currency : 'EUR' }).format(formData.taxAmount || 0)}</span>
                            </div>
                        </div>
                        <div className="border-t border-white/20 dark:border-white/20 light:border-border my-2" />
                        <div className="flex justify-between text-lg font-bold text-white dark:text-white light:text-foreground">
                            <span>Total:</span>
                            <span>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: (formData.currency && formData.currency.length === 3) ? formData.currency : 'EUR' }).format(formData.total || 0)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

    );
}
