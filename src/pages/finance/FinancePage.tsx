import { useState, useEffect } from 'react';
import { getInvoices } from '@/api/crm';
import type { Invoice } from '@/types/crm';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { toast } from 'sonner';

export default function FinancePage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [invData] = await Promise.all([
                    getInvoices(),
                    new Promise(resolve => setTimeout(resolve, 800))
                ]);
                setInvoices(invData);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar datos financieros');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <KingdomLoader />;

    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    const pendingAmount = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);
    const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Panel Financiero</h2>
                <p className="text-muted-foreground">Resumen de ingresos y estados de cuenta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Ingresos Totales</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}</span>
                        <span className="text-xs text-green-500 font-medium whitespace-nowrap">Cobrado</span>
                    </div>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Pendiente de Cobro</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-orange-500">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(pendingAmount)}</span>
                    </div>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Vencido</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-red-500">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(overdueAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Future charts or more complex metrics can go here */}
            <div className="p-12 border border-dashed border-border rounded-xl text-center text-muted-foreground">
                <p>Gráficos de flujo de caja próximamente...</p>
            </div>
        </div>
    );
}
