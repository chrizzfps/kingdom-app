import { motion } from 'framer-motion';
import type { ProposalModule } from '@/types/proposal';
import { MotionSection } from '../common/MotionSection';
import { AnimatedTitle } from '../common/AnimatedTitle';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function IntroSection({ module }: { module: ProposalModule }) {
    const { heading, content, solutionSummary } = module.data;

    return (
        <MotionSection className="py-12 md:py-16 px-4 sm:px-6 md:px-10 bg-zinc-50 text-zinc-950 relative overflow-hidden snap-start">
            <div className="absolute top-0 right-0 w-[280px] md:w-[480px] h-[280px] md:h-[480px] bg-zinc-200/50 rounded-full blur-[80px] md:blur-[110px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[240px] md:w-[420px] h-[240px] md:h-[420px] bg-zinc-300/40 rounded-full blur-[70px] md:blur-[100px] pointer-events-none" />
            <svg
                aria-hidden="true"
                viewBox="0 0 800 800"
                className="absolute -right-24 md:right-0 -top-24 md:top-2 w-[340px] md:w-[460px] h-[340px] md:h-[460px] opacity-[0.22] pointer-events-none"
            >
                <defs>
                    <linearGradient id="introOrb" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#111827" stopOpacity="0.45" />
                        <stop offset="50%" stopColor="#6b7280" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#d4d4d8" stopOpacity="0.15" />
                    </linearGradient>
                </defs>
                <circle cx="400" cy="400" r="230" fill="none" stroke="url(#introOrb)" strokeWidth="2.5" />
                <circle cx="400" cy="400" r="170" fill="none" stroke="url(#introOrb)" strokeWidth="1.5" />
                <path d="M180 400 Q400 230 620 400" fill="none" stroke="url(#introOrb)" strokeWidth="2" />
            </svg>

            <div className="max-w-6xl w-full mx-auto relative z-10 flex flex-col gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="text-center lg:text-left"
                >
                    <AnimatedTitle
                        text={heading || "Situación Actual"}
                        className="font-semibold tracking-tight text-[clamp(1.9rem,4.8vw,3.4rem)] leading-[1.03] bg-clip-text text-transparent bg-gradient-to-r from-zinc-950 via-zinc-700 to-zinc-500"
                    />
                    <motion.div
                        initial={{ width: 0, opacity: 0.4 }}
                        whileInView={{ width: 88, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, duration: 0.45 }}
                        className="h-[2px] bg-gradient-to-r from-zinc-800 to-transparent rounded-full mx-auto lg:mx-0 mt-3"
                    />
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                    <motion.article
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="rounded-2xl border border-zinc-200 bg-white/92 backdrop-blur-xl shadow-[0_20px_60px_-48px_rgba(0,0,0,0.35)] p-5 md:p-6 flex flex-col gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 md:p-3 rounded-xl bg-zinc-950/5 border border-zinc-200">
                                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-zinc-700" />
                            </div>
                            <h3 className="font-semibold text-zinc-900 tracking-tight text-[clamp(1rem,2vw,1.35rem)]">El Desafío</h3>
                        </div>
                        <p className="text-zinc-600 whitespace-pre-wrap text-[clamp(0.88rem,1.55vw,1.06rem)] leading-relaxed">
                            {content}
                        </p>
                    </motion.article>

                    {solutionSummary && (
                        <motion.article
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.08 }}
                            className="rounded-2xl border border-zinc-200 bg-white/92 backdrop-blur-xl shadow-[0_20px_60px_-48px_rgba(0,0,0,0.35)] p-5 md:p-6 flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 md:p-3 rounded-xl bg-zinc-950/5 border border-zinc-200">
                                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-zinc-900" />
                                </div>
                                <h3 className="font-semibold text-zinc-900 tracking-tight text-[clamp(1rem,2vw,1.35rem)]">Nuestra Estrategia</h3>
                            </div>
                            <div className="border-l-2 border-zinc-300 pl-3 md:pl-4">
                                <p className="text-zinc-700 italic whitespace-pre-wrap text-[clamp(0.92rem,1.65vw,1.14rem)] leading-relaxed font-medium">
                                    "{solutionSummary}"
                                </p>
                            </div>
                        </motion.article>
                    )}
                </div>
            </div>
        </MotionSection>
    );
}
