import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getInvoices } from '@/api/crm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { DollarSign, TrendingUp } from 'lucide-react';

interface MonthlyData {
    month: string;
    paid: number;
    pending: number;
    total: number;
}

export function RevenueChart() {
    const [data, setData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const { user } = useAuth();
    const { isAdmin } = useRole();

    useEffect(() => {
        // Don't load data for non-admin users
        if (!isAdmin || !user) {
            setLoading(false);
            return;
        }

        async function loadRevenueData() {
            try {
                const invoices = await getInvoices();

                // Get last 12 months
                const months: MonthlyData[] = [];
                const now = new Date();

                for (let i = 11; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

                    const monthInvoices = invoices.filter(inv => {
                        const invDate = (inv.date as any)?.seconds
                            ? new Date((inv.date as any).seconds * 1000)
                            : new Date(inv.date);
                        return invDate.getMonth() === date.getMonth() &&
                            invDate.getFullYear() === date.getFullYear();
                    });

                    const paid = monthInvoices
                        .filter(inv => inv.status === 'paid')
                        .reduce((sum, inv) => sum + inv.total, 0);

                    const pending = monthInvoices
                        .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
                        .reduce((sum, inv) => sum + inv.total, 0);

                    months.push({
                        month: monthKey,
                        paid,
                        pending,
                        total: paid + pending
                    });
                }

                setData(months);
                setTotalRevenue(months.reduce((sum, m) => sum + m.paid, 0));
            } catch (error) {
                console.error('Error loading revenue data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadRevenueData();
    }, [user, isAdmin]);

    // Don't render for non-admin users (AFTER hooks)
    if (!isAdmin) {
        return null;
    }

    if (loading) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-brand-blue" />
                        Resumen Financiero
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Últimos 12 meses</span>
                    </div>
                </div>
                <p className="text-2xl font-bold text-brand-blue">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}
                </p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="month"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                color: 'hsl(var(--foreground))'
                            }}
                            formatter={(value: any) => [
                                value ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value)) : '€0',
                                ''
                            ]}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar
                            dataKey="paid"
                            name="Pagado"
                            fill="hsl(var(--brand-blue))"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="pending"
                            name="Pendiente"
                            fill="hsl(var(--muted-foreground))"
                            opacity={0.5}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
