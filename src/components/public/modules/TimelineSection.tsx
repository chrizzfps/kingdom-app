import { motion } from 'framer-motion';
import type { ProposalModule } from '@/types/proposal';
import { useState, useEffect } from 'react';
import { MotionSection } from '../common/MotionSection';
import { AnimatedTitle } from '../common/AnimatedTitle';
import { getDotClasses, getTaskClasses } from '@/lib/timeline';

export function TimelineSection({ module, allModules }: { module: ProposalModule; allModules?: ProposalModule[] }) {
    const steps = module.data.steps || [];
    const useSameTimeline = module.data.useSameTimeline ?? true;
    const heading = module.data.heading || 'Cronograma del Proyecto';

    const optionsModule = allModules?.find(m => m.type === 'OPTIONS');
    const optionsList = optionsModule?.data?.options || [];
    const hasMultipleOptions = optionsList.length > 0;

    const [activeOpt, setActiveOpt] = useState<string | null>(null);

    useEffect(() => {
        if (!useSameTimeline && hasMultipleOptions && !activeOpt) {
            setActiveOpt(optionsList[0].id);
        }
    }, [useSameTimeline, hasMultipleOptions, activeOpt, optionsList]);

    const filtered: any[] = useSameTimeline
        ? steps
        : (activeOpt ? steps.filter((s: any) => s.optionId === activeOpt) : []);

    return (
        <MotionSection className="p-4 md:p-8 bg-white text-zinc-950" minH="min-h-[100dvh]">
            <div className="max-w-4xl w-full h-full flex flex-col min-h-0">
                <AnimatedTitle
                    text={heading}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight text-center mb-6 md:mb-10 text-zinc-950"
                />

                {!useSameTimeline && hasMultipleOptions && (
                    <div className="flex justify-center mb-6">
                        <div className="flex gap-2 bg-zinc-100 rounded-full p-1 border border-zinc-200 overflow-x-auto max-w-full">
                            {optionsList.map((opt: any) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setActiveOpt(opt.id)}
                                    className={`px-3 py-1.5 text-xs md:text-sm rounded-full transition whitespace-nowrap ${
                                        opt.id === activeOpt
                                            ? 'bg-zinc-950 text-white font-medium'
                                            : 'text-zinc-500 hover:text-zinc-800'
                                    }`}
                                >
                                    {opt.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="relative border-l border-zinc-200 ml-4 md:ml-12 space-y-8 md:space-y-10 pr-1">
                    {/* Animated progress line */}
                    <motion.div
                        className="absolute left-0 top-0 w-[2px] bg-zinc-800/60 origin-top"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: filtered.length * 0.18, ease: 'easeInOut', delay: 0.2 }}
                        style={{ height: '100%' }}
                    />

                    {filtered.map((step: any, index: number) => (
                        <motion.div
                            key={`${activeOpt}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: index * 0.1 }}
                            className="relative pl-6 md:pl-12"
                        >
                            <div className={`absolute -left-[5px] top-1.5 md:top-2 w-2.5 h-2.5 rounded-full ${getDotClasses(step)}`} />
                            <div>
                                <span className="inline-flex items-center gap-2 text-xs md:text-sm text-zinc-700 font-mono tracking-wider bg-zinc-100 px-2 py-1 rounded border border-zinc-200 flex-wrap">
                                    {step.phase}
                                    {step.badge && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-300 bg-zinc-200">
                                            {step.badge}
                                        </span>
                                    )}
                                </span>
                                <h3 className={`text-lg md:text-2xl font-semibold mt-1.5 md:mt-2 ${getTaskClasses(step.important)} leading-snug tracking-tight`}>
                                    {step.task}
                                </h3>
                            </div>
                        </motion.div>
                    ))}

                    {filtered.length === 0 && (
                        <p className="pl-6 md:pl-12 text-zinc-400 text-sm italic">
                            Sin pasos configurados para esta opción.
                        </p>
                    )}
                </div>
            </div>
        </MotionSection>
    );
}
