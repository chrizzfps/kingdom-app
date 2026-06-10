import type { ProposalModule } from '@/types/proposal';
import React from 'react';
import { PUBLIC_MODULE_REGISTRY } from './moduleRegistry';

interface ModuleRendererProps {
    module: ProposalModule;
    allModules?: ProposalModule[];
}

function ModuleRendererInner({ module, allModules }: ModuleRendererProps) {
    if (!module.isVisible) return null;

    const Component = PUBLIC_MODULE_REGISTRY[module.type];

    if (!Component) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-500 snap-start">
                <div className="text-center p-8">
                    <p>{module.type} (módulo no implementado)</p>
                </div>
            </section>
        );
    }

    return <Component module={module} allModules={allModules} />;
}

export const ModuleRenderer = React.memo(ModuleRendererInner);
