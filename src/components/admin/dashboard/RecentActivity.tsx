import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getProposals } from '@/api/proposals';
import type { Proposal } from '@/types/proposal';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function RecentActivity() {
  const [activities, setActivities] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Don't load if user is not authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadActivity() {
      try {
        const proposals = await getProposals();
        // Sort by updatedAt desc and take top 5
        const recent = proposals
          .sort((a, b) => {
            const dateA = a.updatedAt?.seconds ? new Date(a.updatedAt.seconds * 1000) : new Date(a.updatedAt);
            const dateB = b.updatedAt?.seconds ? new Date(b.updatedAt.seconds * 1000) : new Date(b.updatedAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);
        setActivities(recent);
      } catch (error: any) {
        console.error("Error loading activity:", error);
        // Check if it's a permissions error
        if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
          toast.error('No tienes permisos para ver esta actividad. Por favor, inicia sesión.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, [user]);

  if (loading) {
    return (
      <Card className="col-span-3">
        <CardHeader><CardTitle>Actividad Reciente</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length === 0 && <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>}

          {activities.map((item) => {
            const date = item.updatedAt?.seconds ? new Date(item.updatedAt.seconds * 1000) : new Date(item.updatedAt);
            let actionText = "Actualizado";

            if (item.status === 'published') { actionText = "Publicado"; }
            if (item.status === 'accepted') { actionText = "Aceptado"; }

            return (
              <div key={item.id} className="flex items-center">
                <span className={`relative flex h-2 w-2 mr-4`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.status === 'published' ? 'bg-blue-400' : 'bg-zinc-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${item.status === 'published' ? 'bg-blue-500' : 'bg-zinc-500'}`}></span>
                </span>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {item.type === 'portfolio' ? 'Portafolio' : 'Propuesta'} {actionText}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.clientName}</p>
                </div>
                <div className="ml-auto font-medium text-xs text-muted-foreground">
                  {formatDistanceToNow(date, { addSuffix: true, locale: es })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
