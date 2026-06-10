import { motion, useReducedMotion } from 'framer-motion';
import type { ProposalModule } from '@/types/proposal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Props {
    module: ProposalModule;
}

export function PortfolioCTASection({ module }: Props) {
    const data = module.data || {};
    const { title, subtitle, buttonText, buttonLink } = data;
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className="min-h-[100dvh] flex items-center justify-center py-20 px-6 md:px-12 relative overflow-hidden bg-black text-center snap-start">
            {/* Background Texture & Gradients */}
            <div className="absolute inset-0 pointer-events-none select-none">
                {/* Main Glow Orb - Animated */}
                <motion.div
                    animate={shouldReduceMotion ? { scale: 1, opacity: 0.3 } : {
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={shouldReduceMotion ? {} : {
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-zinc-600/10 rounded-full blur-[120px]"
                />

                {/* Secondary touches */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-zinc-700/10 rounded-full blur-[80px]" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-zinc-700/10 rounded-full blur-[80px]" />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_80%)]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    {/* Decorative element like Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                        <Sparkles className="w-6 h-6 text-yellow-200" />
                    </motion.div>

                    <h2 className="text-5xl md:text-8xl font-semibold tracking-tight mb-8 leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
                        {title || "¿Listo para empezar?"}
                    </h2>

                    {subtitle && (
                        <p className="text-lg md:text-3xl text-zinc-300 font-normal max-w-2xl mx-auto leading-relaxed mb-12">
                            {subtitle}
                        </p>
                    )}

                    {buttonText && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="lg"
                                className="bg-white text-black hover:bg-zinc-200 rounded-full px-10 h-16 text-lg md:text-xl font-medium shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all duration-300"
                                asChild
                            >
                                <a href={buttonLink || '#'} target="_blank" rel="noopener noreferrer">
                                    {buttonText} <ArrowRight className="ml-2 h-6 w-6" />
                                </a>
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Bottom fading line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>
    );
}
