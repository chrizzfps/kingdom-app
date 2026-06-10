import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import type { Proposal, ProposalModule } from '@/types/proposal';
import { ModuleRenderer } from '@/components/public/ModuleRenderer';
import { useAuth } from '@/hooks/useAuth';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function PreviewProposalView() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [modules, setModules] = useState<ProposalModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { getProposal } = await import('@/api/proposals');
      const data = await getProposal(id);
      setProposal(data);
      if (data?.id) {
        const { getModules } = await import('@/api/modules');
        const mods = await getModules(data.id);
        setModules(mods);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (authLoading || loading) {
    return <KingdomLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!proposal) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        Proposal not found
      </div>
    );
  }

  return (
    <div className="public-proposal-theme bg-white min-h-screen">
      <div className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        {modules.map((module) => (
          <ModuleRenderer key={module.id} module={module} />
        ))}
        <PublicFooter />
      </div>
    </div>
  );
}
