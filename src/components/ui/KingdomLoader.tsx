import { motion } from 'framer-motion';
import { Isotipo } from './Isotipo';
import { cn } from '@/lib/utils';

interface KingdomLoaderProps {
    fullscreen?: boolean;
    className?: string;
}

export function KingdomLoader({ fullscreen = false, className }: KingdomLoaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
                "inset-0 bg-background flex items-center justify-center z-[100]",
                fullscreen ? "fixed" : "absolute",
                className
            )}
        >
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] animate-pulse" />
            </div>

            <div className="relative flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 1,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="relative"
                >
                    {/* Multiple animated rings */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-8 border border-primary/5 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-12 border border-primary/10 border-dashed rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 border-2 border-transparent border-t-primary/40 rounded-full"
                    />

                    {/* Main Isotype with Glow */}
                    <motion.div
                        animate={{
                            y: [0, -8, 0],
                            filter: [
                                'drop-shadow(0 0 0px rgba(var(--primary), 0))',
                                'drop-shadow(0 0 20px rgba(var(--primary), 0.2))',
                                'drop-shadow(0 0 0px rgba(var(--primary), 0))',
                            ]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-24 h-24 text-foreground relative z-10"
                    >
                        <Isotipo />
                    </motion.div>
                </motion.div>

                {/* Loading Text and Bar */}
                <div className="mt-20 flex flex-col items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <span className="text-[10px] uppercase tracking-[0.6em] text-foreground/40 font-bold">
                            Kingdom OS
                        </span>
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        opacity: [0.2, 1, 0.2],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2
                                    }}
                                    className="w-1 h-1 bg-primary rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Elegant progress line */}
                    <div className="w-48 h-[1px] bg-primary/10 relative overflow-hidden rounded-full">
                        <motion.div
                            animate={{
                                x: ['-100%', '100%']
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

