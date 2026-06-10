import { motion, useReducedMotion } from 'framer-motion';
import type { ProposalModule } from '@/types/proposal';
import { MotionSection } from '../common/MotionSection';
import { useEffect, useState, useRef } from 'react';
import { sanitizeColors } from '@/lib/colors';
import { Logo } from '@/components/shared/Logo';
import { ArrowDown, Mouse } from 'lucide-react';

interface SectionProps {
    module: ProposalModule;
}

export function HeroSection({ module }: SectionProps) {
    const { title, subtitle, backgroundImageUrl, backgroundGradient, overlay, showLogo, buttonText, blurLevel } = module.data;
    const [bgReady, setBgReady] = useState(false);
    const [bgFailed, setBgFailed] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (!backgroundImageUrl) return;
        const img = new Image();
        img.onload = () => setBgReady(true);
        img.onerror = () => setBgFailed(true);
        img.src = backgroundImageUrl;
    }, [backgroundImageUrl]);

    const handleScrollDown = () => {
        window.dispatchEvent(new CustomEvent('proposal:next-slide'));
    };

    return (
        <MotionSection
            ref={sectionRef}
            className="overflow-hidden"
            minH="min-h-[100dvh]"
            background={
                <>
                    {backgroundImageUrl && bgReady && !bgFailed && (
                        <img
                            src={backgroundImageUrl}
                            alt="Background"
                            className="absolute inset-0 z-0 w-full h-full object-cover opacity-90"
                            style={{
                                objectPosition: module.data.backgroundPosition
                                    ? `${module.data.backgroundPosition.x}% ${module.data.backgroundPosition.y}%`
                                    : 'center center',
                                filter: `blur(${blurLevel || 0}px)`
                            }}
                            aria-hidden="true"
                        />
                    )}
                    {(!backgroundImageUrl || bgFailed || !bgReady) && backgroundGradient && (
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                background: `linear-gradient(${backgroundGradient.angle}deg, ${sanitizeColors(backgroundGradient.colors).join(', ')})`,
                                backgroundSize: backgroundGradient.animate ? '200% 200%' : undefined,
                                animation: backgroundGradient.animate ? 'gradientMove 12s ease infinite' : undefined,
                            }}
                        />
                    )}
                    {overlay ? <div className="absolute inset-0 z-0" style={{ backgroundColor: `rgba(0,0,0,${(overlay || 0) / 100})` }} /> : null}
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-black/35 to-black/65" />
                </>
            }
        >
            <div className="absolute inset-0 pointer-events-none z-10">
                <motion.div
                    className="absolute top-[17%] left-1/2 -translate-x-1/2 w-[72vw] max-w-[980px] h-[72vw] max-h-[980px] rounded-full border border-white/15"
                    animate={shouldReduceMotion ? {} : { scale: [1, 1.035, 1], opacity: [0.34, 0.5, 0.34] }}
                    transition={shouldReduceMotion ? {} : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[58vw] max-w-[760px] h-[58vw] max-h-[760px] rounded-full border border-white/10"
                    animate={shouldReduceMotion ? {} : { scale: [1.02, 1, 1.02], opacity: [0.22, 0.36, 0.22] }}
                    transition={shouldReduceMotion ? {} : { duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <div className="relative z-20 px-6 md:px-10 max-w-6xl mx-auto h-full w-full flex flex-col items-center justify-center text-center gap-6 md:gap-7 pb-24 md:pb-28">

                {showLogo !== false && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-2"
                    >
                        <Logo mode="light" className="h-10 md:h-12 w-auto" />
                    </motion.div>
                )}

                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
                    className="text-white relative z-20 font-semibold tracking-tight text-balance text-[clamp(2.2rem,5.3vw,5.6rem)] leading-[1.0] max-w-5xl drop-shadow-[0_10px_36px_rgba(0,0,0,0.34)]"
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: 'easeOut', delay: 0.16 }}
                    className="text-base md:text-[1.45rem] text-white/92 max-w-3xl mx-auto leading-relaxed font-normal text-balance"
                >
                    {subtitle}
                </motion.p>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ duration: 0.25, delay: 0.28 }}
                    onClick={handleScrollDown}
                    className="group relative px-8 py-3.5 bg-white text-zinc-950 hover:bg-white/95 border border-white rounded-full text-sm md:text-base font-medium tracking-tight transition-all duration-300 shadow-[0_14px_40px_-16px_rgba(255,255,255,0.7)] hover:shadow-[0_18px_48px_-16px_rgba(255,255,255,0.85)] flex items-center gap-2 mt-4"
                >
                    {buttonText || 'Ver ahora'}
                    <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </motion.button>
            </div>

            <motion.div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 z-20 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: [0, 4, 0] }}
                transition={shouldReduceMotion ? {} : { duration: 2.2, repeat: Infinity, delay: 0.8 }}
            >
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.16em] text-white/80 whitespace-nowrap">
                    <Mouse className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span>Desliza para continuar</span>
                </div>
                <div className="relative h-8 w-5 rounded-full border border-white/45">
                    <motion.div
                        className="absolute left-1/2 top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/85"
                        animate={shouldReduceMotion ? {} : { y: [0, 10, 0], opacity: [1, 0.45, 1] }}
                        transition={shouldReduceMotion ? {} : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
            </motion.div>
        </MotionSection>
    );
}
