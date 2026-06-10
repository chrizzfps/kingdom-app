import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Proposal, ModuleType } from '../types/proposal';
import { DEFAULT_MODULE_DATA } from '../types/proposal';
import { listenModules, createModule, updateModuleData, toggleModuleVisibility as toggleVisibilityApi, deleteModuleById, reorderModulesTx } from '@/api/modules';

export function useProposalBuilder(initialProposal?: Proposal) {
    const [proposal, setProposal] = useState<Proposal>(initialProposal || {
        id: crypto.randomUUID(),
        slug: '',
        clientName: '',
        clientLogoUrl: '',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        currency: 'USD',
        type: 'proposal',
        modules: []
    });

    const attachModulesListener = useCallback((proposalId: string) => {
        return listenModules(proposalId, (mods) => {
            setProposal(prev => ({ ...prev, modules: mods }));
        });
    }, []);

    const addModule = useCallback(async (type: ModuleType) => {
        try {
            await createModule(proposal.id, type, { ...DEFAULT_MODULE_DATA[type] }, proposal.modules.length);
            toast.success("Módulo añadido");
        } catch (error) {
            console.error(error);
            toast.error("Error al añadir el módulo");
        }
    }, [proposal.id, proposal.modules.length]);

    const removeModule = useCallback(async (id: string) => {
        try {
            await deleteModuleById(proposal.id, id);
            toast.success("Módulo eliminado");
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar el módulo");
        }
    }, [proposal.id]);

    const updateModule = useCallback(async (id: string, updates: any) => {
        try {
            const old = proposal.modules.find(m => m.id === id)?.data || {};
            const newData = { ...old, ...(typeof updates === 'object' ? updates : {}) };
            await updateModuleData(proposal.id, id, newData);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar cambios");
        }
    }, [proposal.id, proposal.modules]);

    const toggleModuleVisibility = useCallback(async (id: string) => {
        try {
            const current = proposal.modules.find(m => m.id === id)?.isVisible ?? true;
            await toggleVisibilityApi(proposal.id, id, !current);
        } catch (error) {
            console.error(error);
            toast.error("Error al cambiar visibilidad");
        }
    }, [proposal.id, proposal.modules]);

    const reorderModules = useCallback(async (activeId: string, overId: string) => {
        try {
            await reorderModulesTx(proposal.id, activeId, overId);
        } catch (error) {
            console.error(error);
            toast.error("Error al reordenar módulos");
        }
    }, [proposal.id]);

    const updateProposalField = useCallback((field: keyof Proposal, value: any) => {
        setProposal(prev => ({ ...prev, [field]: value }));
    }, []);

    return {
        proposal,
        setProposal,
        attachModulesListener,
        addModule,
        removeModule,
        updateModule,
        toggleModuleVisibility,
        reorderModules,
        updateProposalField
    };
}
