import { motion } from 'framer-motion';
import { DollarSign, Sparkles } from 'lucide-react';

export function DecorativeLayer({ kind = 'payment' }: { kind?: 'payment' | 'general' }) {
  if (kind === 'payment') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          className="absolute top-10 left-10 text-[hsl(var(--brand-cyan))]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.25, y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <DollarSign className="h-10 w-10" />
        </motion.div>
        <motion.div
          className="absolute bottom-12 right-12 text-[hsl(var(--brand-blue))]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.2, y: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <DollarSign className="h-8 w-8" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/3 text-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15, rotate: [0, 8, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        >
          <Sparkles className="h-8 w-8" />
        </motion.div>
      </div>
    );
  }
  return null;
}

