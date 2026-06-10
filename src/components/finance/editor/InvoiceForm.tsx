import { useFormContext, useFieldArray } from 'react-hook-form';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CalendarIcon, Calculator, ChevronUp, ChevronDown } from 'lucide-react';
import type { Invoice, Client } from '@/types/crm';
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { ClientSelector } from './ClientSelector';
import { ProjectSelector } from './ProjectSelector';
import { ImageUploadField } from '@/components/ui/ImageUploadField';

interface InvoiceFormProps {
    clients: Client[];
    onClientCreated?: (client: Client) => void;
}

export function InvoiceForm({ clients, onClientCreated }: InvoiceFormProps) {
    const { register, control, watch, setValue } = useFormContext<Invoice>();
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "items"
    });

    // Watch values for calculations
    const items = watch('items');
    const taxRate = watch('taxRate');
    const discount = watch('discount') || 0;
    const currency = watch('currency');

    // Live Calculations
    useEffect(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const taxableAmount = Math.max(0, subtotal - discount);
        const taxAmount = taxableAmount * (taxRate / 100);
        const total = taxableAmount + taxAmount;

        setValue('subtotal', subtotal);
        setValue('taxAmount', taxAmount);
        setValue('total', total);

        // Update item totals
        items.forEach((item, index) => {
            setValue(`items.${index}.total`, item.quantity * item.price);
        });
    }, [items, taxRate, discount, setValue]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency || 'EUR'
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <Accordion type="multiple" defaultValue={['client', 'details', 'items', 'totals']} className="w-full">
                {/* 1. Client & Project */}
                <AccordionItem value="client" className="border-b-0 mb-4 bg-muted/20 rounded-lg border border-border px-4">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg">
                        Datos del Cliente
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Cliente</Label>
                            <ClientSelector clients={clients} onClientCreated={onClientCreated} />
                        </div>
                        <div className="space-y-2">
                            <Label>Proyecto (Opcional)</Label>
                            <ProjectSelector clientId={watch('clientId')} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 2. Invoice Details */}
                <AccordionItem value="details" className="border-b-0 mb-4 bg-muted/20 rounded-lg border border-border px-4">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg">
                        Detalles de Factura
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Número</Label>
                            <Input {...register('number')} className="bg-background" />
                        </div>
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select onValueChange={(v: any) => setValue('status', v)} defaultValue={watch('status')}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Borrador</SelectItem>
                                    <SelectItem value="sent">Enviada</SelectItem>
                                    <SelectItem value="paid">Pagada</SelectItem>
                                    <SelectItem value="overdue">Vencida</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Emisión</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-background", !watch('date') && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {watch('date') ? format(watch('date'), "PPP", { locale: es }) : <span>Fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={watch('date')} onSelect={(d: Date | undefined) => d && setValue('date', d)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Vencimiento</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-background", !watch('dueDate') && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {watch('dueDate') ? format(watch('dueDate'), "PPP", { locale: es }) : <span>Fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={watch('dueDate')} onSelect={(d: Date | undefined) => d && setValue('dueDate', d)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Moneda</Label>
                            <Select onValueChange={(v) => setValue('currency', v)} defaultValue={watch('currency')}>
                                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="MXN">MXN ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 3. Items */}
                <AccordionItem value="items" className="border-b-0 mb-4 bg-muted/20 rounded-lg border border-border px-4">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg">
                        Conceptos
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-4">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="group relative border border-border/50 shadow-none hover:border-brand-blue/30 transition-colors">
                                <CardContent className="p-4 grid grid-cols-12 gap-3 items-end">
                                    {/* Description */}
                                    <div className="col-span-12 md:col-span-7 space-y-1">
                                        <Label className="text-xs text-muted-foreground">Descripción</Label>
                                        <Input {...register(`items.${index}.description` as const)} placeholder="Servicio..." className="bg-background border-transparent focus:border-input hover:border-input transition-all" />
                                    </div>

                                    {/* Qty */}
                                    <div className="col-span-4 md:col-span-2 space-y-1">
                                        <Label className="text-xs text-muted-foreground">Cant.</Label>
                                        <Input type="number" step="0.01" {...register(`items.${index}.quantity` as const, { valueAsNumber: true })} className="text-center bg-background" />
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-4 md:col-span-2 space-y-1">
                                        <Label className="text-xs text-muted-foreground">Precio</Label>
                                        <Input type="number" step="0.01" {...register(`items.${index}.price` as const, { valueAsNumber: true })} className="text-right bg-background" />
                                    </div>

                                    {/* Delete/Move Btns */}
                                    <div className="col-span-4 md:col-span-1 flex justify-end gap-1">
                                        <div className="flex flex-col">
                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => index > 0 && move(index, index - 1)} disabled={index === 0}>
                                                <ChevronUp className="h-3 w-3" />
                                            </Button>
                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => index < fields.length - 1 && move(index, index + 1)} disabled={index === fields.length - 1}>
                                                <ChevronDown className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive h-full">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => append({ id: Date.now().toString(), description: '', quantity: 1, price: 0, total: 0 })} className="w-full border-dashed">
                            <Plus className="h-4 w-4 mr-2" /> Agregar Concepto
                        </Button>
                    </AccordionContent>
                </AccordionItem>

                {/* 4. Totals & Notes */}
                <AccordionItem value="totals" className="border-b-0 mb-4 bg-muted/20 rounded-lg border border-border px-4">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg">
                        Totales y Notas
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-6">
                        <div className="space-y-4 p-4 bg-background rounded-lg border border-border">
                            <div className="flex items-center justify-between">
                                <Label className="text-muted-foreground">Impuestos (%)</Label>
                                <Input type="number" className="w-24 text-right" {...register('taxRate', { valueAsNumber: true })} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-muted-foreground">Descuento ({currency})</Label>
                                <Input type="number" className="w-24 text-right" {...register('discount', { valueAsNumber: true })} />
                            </div>
                            <div className="border-t pt-4 flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatMoney(watch('subtotal'))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Impuestos</span>
                                    <span>{formatMoney(watch('taxAmount'))}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-brand-blue">
                                    <span>Total</span>
                                    <span>{formatMoney(watch('total'))}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Calculator className="h-4 w-4" /> Notas / Términos</Label>
                            <Textarea {...register('notes')} placeholder="Términos de pago, cuenta bancaria, etc." className="bg-background min-h-[100px]" />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* 5. Branding (Optional) */}
                <AccordionItem value="branding" className="border-b-0 mb-4 bg-muted/20 rounded-lg border border-border px-4">
                    <AccordionTrigger className="hover:no-underline font-semibold text-lg">
                        Personalización (Branding)
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 space-y-4">
                        <p className="text-xs text-muted-foreground mb-4">
                            Por defecto se usará la configuración de la agencia. Puedes personalizarlo para esta factura.
                        </p>
                        <ImageUploadField
                            label="Header Background"
                            value={watch('headerBgUrl')}
                            onChange={(url) => setValue('headerBgUrl', url)}
                            placeholder="Imagen superior del PDF"
                        />
                        <ImageUploadField
                            label="Footer Background"
                            value={watch('footerBgUrl')}
                            onChange={(url) => setValue('footerBgUrl', url)}
                            placeholder="Imagen inferior del PDF"
                        />
                        <ImageUploadField
                            label="Logo (Opcional)"
                            value={watch('logoUrl')}
                            onChange={(url) => setValue('logoUrl', url)}
                            placeholder="Logo personalizado"
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
