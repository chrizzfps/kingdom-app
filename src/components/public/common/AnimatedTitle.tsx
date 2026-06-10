import { motion } from 'framer-motion';

export function AnimatedTitle({ text, className = '' }: { text: string; className?: string }) {
  return (
    <motion.h2
      className={className}
      aria-label={text}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {text}
    </motion.h2>
  );
}

