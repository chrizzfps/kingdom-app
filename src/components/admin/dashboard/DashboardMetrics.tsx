import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, Users, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getInvoices, getClients } from '@/api/crm';
import { getProposals } from '@/api/proposals';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { toast } from 'sonner';

interface Metrics {
  totalRevenue: number;
  activeProposals: number;
  activeClients: number;
  closureRate: number;
}

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAdmin } = useRole();

  useEffect(() => {
    // Don't load if user is not authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadMetrics() {
      try {
        const [invoices, clients, proposals] = await Promise.all([
          getInvoices(),
          getClients(),
          getProposals()
        ]);

        const totalRevenue = invoices
          .filter(i => i.status === 'paid')
          .reduce((sum, i) => sum + i.total, 0);

        const activeProposals = proposals.filter(p => p.type === 'proposal' && p.status === 'published').length;
        const totalProposals = proposals.filter(p => p.type === 'proposal').length;
        const acceptedProposals = proposals.filter(p => p.type === 'proposal' && p.status === 'accepted').length;

        const closureRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;

        setMetrics({
          totalRevenue,
          activeProposals,
          activeClients: clients.length,
          closureRate
        });
      } catch (error: any) {
        console.error("Error loading dashboard metrics:", error);
        // Check if it's a permissions error
        if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
          toast.error('No tienes permisos para ver estas métricas. Por favor, inicia sesión.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [user]);

  if (loading || !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Ingresos Totales - Admin Only */}
      {isAdmin && (
        <Card className="bg-gradient-to-br from-brand-blue/10 to-transparent border-brand-blue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-blue">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(metrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Histórico total</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Propuestas Activas</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeProposals}</div>
          <p className="text-xs text-muted-foreground">Publicadas actualmente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeClients}</div>
          <p className="text-xs text-muted-foreground">Registrados en CRM</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Cierre</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.closureRate}%</div>
          <p className="text-xs text-muted-foreground">Propuestas aceptadas</p>
        </CardContent>
      </Card>
    </div>
  );
}
