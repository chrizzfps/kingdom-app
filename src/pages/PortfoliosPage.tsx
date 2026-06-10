import { useEffect, useState } from 'react';
import { createProposal, deleteProposal, getProposals, slugExists } from '@/api/proposals';
import type { Proposal, ProposalType, PortfolioType } from '@/types/proposal';
import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader';
import { ProposalList } from '@/components/admin/dashboard/ProposalList';
import { KingdomLoader } from '@/components/ui/KingdomLoader';

export default function PortfoliosPage() {
    const [portfolios, setPortfolios] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPortfolios = async () => {
        setLoading(true);
        try {
            const [data] = await Promise.all([
                getProposals(),
                new Promise(resolve => setTimeout(resolve, 1000)) // Min delay for premium feel
            ]);
            setPortfolios(data.filter(p => p.type === 'portfolio'));
        } catch (error) {
            console.error("Error loading portfolios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPortfolios();
    }, []);

    const handleCreate = async ({ name, portfolioType }: { type: ProposalType; portfolioType?: PortfolioType; name: string }) => {
        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        let slug = baseSlug;
        let counter = 1;

        while (await slugExists(slug)) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        try {
            await createProposal({
                clientName: name,
                slug,
                type: 'portfolio', // Force portfolio type
                portfolioType: portfolioType || 'web'
            });
            await loadPortfolios();
        } catch (error) {
            console.error("Error creating portfolio:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este portafolio?')) return;
        try {
            await deleteProposal(id);
            await loadPortfolios();
        } catch (error) {
            console.error("Error deleting portfolio:", error);
        }
    };

    if (loading) return <KingdomLoader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <DashboardHeader
                onCreate={handleCreate}
                defaultType="portfolio"
            />
            <ProposalList items={portfolios} onDelete={handleDelete} />
        </div>
    );
}
