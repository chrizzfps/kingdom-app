import { motion } from 'framer-motion';
import type { ProposalModule } from '@/types/proposal';
import { MotionSection } from '../common/MotionSection';
import { AnimatedTitle } from '../common/AnimatedTitle';

interface SectionProps {
  module: ProposalModule;
}

export function TextSection({ module }: SectionProps) {
  const { content, heading } = module.data || {};

  return (
    <MotionSection className="px-6 md:px-10 bg-zinc-950 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative max-w-4xl mx-auto"
      >
        <div className="relative rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl p-8 md:p-10 shadow-2xl shadow-black/30">
          <AnimatedTitle
            text={heading || 'Detalle'}
            className="heading-3 mb-5 text-white tracking-tight"
          />
          <p className="text-zinc-300/95 leading-relaxed whitespace-pre-line text-base md:text-lg">
            {String(content || '')}
          </p>
          <div className="absolute -inset-px rounded-2xl pointer-events-none bg-gradient-to-br from-white/10 to-transparent" />
        </div>
      </motion.div>
    </MotionSection>
  );
}
