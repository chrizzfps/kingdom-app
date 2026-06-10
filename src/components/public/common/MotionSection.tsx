import { motion } from 'framer-motion';
import { type ReactNode, forwardRef } from 'react';

export const MotionSection = forwardRef<HTMLElement, {
  children: ReactNode;
  className?: string;
  minH?: string;
  background?: ReactNode;
}>(({
  children,
  className = '',
  minH = 'min-h-[100dvh]',
  background,
}, ref) => {
  return (
    <section ref={ref} className={`${minH} relative flex flex-col items-center justify-center snap-start overflow-hidden ${className}`}>
      {background && <div className="absolute inset-0 z-0">{background}</div>}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center"
      >
        {children}
      </motion.div>
    </section>
  );
});

MotionSection.displayName = 'MotionSection';

