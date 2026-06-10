import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function HelpPanel({ title, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg bg-card">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-2 text-sm">
        <span className="font-medium">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 py-3 text-sm text-muted-foreground">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

