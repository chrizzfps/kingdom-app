import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, FileText, AlertCircle, Clock } from 'lucide-react';
import type { Invoice } from '@/types/crm';

interface InvoiceStatsProps {
    invoices: Invoice[];
    currency?: string;
}

export function InvoiceStats({ invoices, currency = 'EUR' }: InvoiceStatsProps) {
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount);
    };

    const totalRevenue = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total, 0);

    const outstanding = invoices
        .filter(i => i.status === 'sent' || i.status === 'overdue')
        .reduce((sum, i) => sum + i.total, 0);

    const overdueCount = invoices.filter(i => i.status === 'overdue').length;

    // Average pay time logic could go here, for now just count draft
    const drafts = invoices.filter(i => i.status === 'draft').length;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatMoney(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">Facturas pagadas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendiente de Cobro</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatMoney(outstanding)}</div>
                    <p className="text-xs text-muted-foreground">Enviadas y vencidas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
                    <p className="text-xs text-muted-foreground">Requieren acción inmediata</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Borradores</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{drafts}</div>
                    <p className="text-xs text-muted-foreground">En preparación</p>
                </CardContent>
            </Card>
        </div>
    );
}
