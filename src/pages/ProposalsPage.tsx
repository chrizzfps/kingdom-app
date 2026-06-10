import { useEffect, useState } from 'react';
import { createProposal, deleteProposal, getProposals, slugExists } from '@/api/proposals';
import type { Proposal, ProposalType, PortfolioType } from '@/types/proposal';
import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader';
import { ProposalList } from '@/components/admin/dashboard/ProposalList';
import { KingdomLoader } from '@/components/ui/KingdomLoader';

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    const loadProposals = async () => {
        setLoading(true);
        try {
            const [data] = await Promise.all([
                getProposals(),
                new Promise(resolve => setTimeout(resolve, 1000)) // Min delay for premium feel
            ]);
            setProposals(data.filter(p => p.type === 'proposal' || !p.type));
        } catch (error) {
            console.error("Error loading proposals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProposals();
    }, []);

    const handleCreate = async ({ name }: { type: ProposalType; portfolioType?: PortfolioType; name: string }) => {
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
                type: 'proposal', // Force proposal type
            });
            await loadProposals();
        } catch (error) {
            console.error("Error creating proposal:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta propuesta?')) return;
        try {
            await deleteProposal(id);
            await loadProposals();
        } catch (error) {
            console.error("Error deleting proposal:", error);
        }
    };

    if (loading) return <KingdomLoader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <DashboardHeader
                onCreate={handleCreate}
                defaultType="proposal"
            />
            <ProposalList items={proposals} onDelete={handleDelete} />
        </div>
    );
}
