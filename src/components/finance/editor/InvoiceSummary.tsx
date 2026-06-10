import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, User, Calendar, Package } from 'lucide-react';
import type { Invoice, Client } from '@/types/crm';

interface InvoiceSummaryProps {
    clients: Client[];
}

export function InvoiceSummary({ clients }: InvoiceSummaryProps) {
    const { watch } = useFormContext<Invoice>();

    const clientId = watch('clientId');
    const number = watch('number');
    const date = watch('date');
    const dueDate = watch('dueDate');
    const items = watch('items') || [];
    const subtotal = watch('subtotal') || 0;
    const discount = watch('discount') || 0;
    const taxRate = watch('taxRate') || 0;
    const taxAmount = watch('taxAmount') || 0;
    const total = watch('total') || 0;
    const currency = watch('currency') || 'EUR';

    const client = clients.find(c => c.id === clientId);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (d: Date | undefined) => {
        if (!d) return '—';
        try {
            return format(d, "d MMM yyyy", { locale: es });
        } catch {
            return '—';
        }
    };

    return (
        <Card className="sticky top-4 bg-card border shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Resumen de Factura
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                {/* Header Info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="font-medium text-foreground">
                            {client?.name || 'Sin cliente'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{number || 'Sin número'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(date)} → {formatDate(dueDate)}</span>
                    </div>
                </div>

                <Separator />

                {/* Items */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <Package className="h-3 w-3" />
                        Conceptos ({items.length})
                    </div>
                    {items.length === 0 ? (
                        <p className="text-muted-foreground text-xs italic">Sin conceptos</p>
                    ) : (
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs py-1 border-b border-dashed border-border/50 last:border-0">
                                    <span className="truncate flex-1 pr-2">
                                        {item.description || `Item ${idx + 1}`}
                                    </span>
                                    <span className="font-mono text-muted-foreground whitespace-nowrap">
                                        {item.quantity} × {formatMoney(item.price)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatMoney(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-xs text-destructive">
                            <span>Descuento</span>
                            <span>-{formatMoney(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">IVA ({taxRate}%)</span>
                        <span>{formatMoney(taxAmount)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">{formatMoney(total)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
