import { motion } from 'framer-motion';
import type { ProposalModule } from '@/types/proposal';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectSectionProps {
    module: ProposalModule;
}

export function ProjectSection({ module }: ProjectSectionProps) {
    const data = module.data || {};
    const { title, description, imageUrl, category, link } = data;

    const isVideo = data.mediaType === 'video';

    return (
        <section className="min-h-[100dvh] flex items-center justify-center py-10 md:py-14 px-6 md:px-12 relative overflow-hidden text-center md:text-left snap-start transition-colors duration-500 bg-white">
            {/* Animated Light Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-200 animate-gradient-slow opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.8))]" />

            {/* Subtle Grid Pattern for texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

            <div className="max-w-[1320px] w-full mx-auto relative z-10">
                <div className="flex flex-col md:flex-row gap-8 md:gap-20 items-center justify-between">

                    {/* Media Side (55%) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full md:w-[55%] order-2 md:order-1"
                    >
                        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-slate-200 relative group bg-slate-100">
                            {isVideo ? (
                                data.videoUrl ? (
                                    <iframe
                                        src={data.videoUrl.replace("watch?v=", "embed/")}
                                        title={title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-sm">
                                        NO VIDEO URL
                                    </div>
                                )
                            ) : (
                                imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-mono text-sm">
                                        IMAGEN DEL PROYECTO
                                    </div>
                                )
                            )}

                            {/* Overlay Gradient (Image only) */}
                            {!isVideo && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />}
                        </div>
                    </motion.div>

                    {/* Content Side (45%) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="w-full md:w-[45%] space-y-8 order-1 md:order-2"
                    >
                        <div className="space-y-4">
                            {category && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-3 justify-center md:justify-start"
                                >
                                    <div className="h-[1px] w-8 bg-zinc-400" />
                                    <span className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em]">
                                        {category}
                                    </span>
                                </motion.div>
                            )}
                        <h2 className="text-4xl md:text-6xl font-semibold text-black leading-[1.1] tracking-tight text-balance">
                                {title || "Título del Proyecto"}
                            </h2>
                        </div>

                        <p className="text-slate-600 text-base md:text-xl leading-relaxed text-balance max-w-xl mx-auto md:mx-0">
                            {description || "Descripción del proyecto. Detalla el desafío, la solución y el impacto generado."}
                        </p>

                        {link && (
                            <div className="pt-4">
                                <Button asChild variant="outline" className="rounded-full px-8 h-12 text-base border-slate-300 text-black hover:bg-black hover:text-white transition-all duration-300 hover:scale-105">
                                    <a href={link} target="_blank" rel="noopener noreferrer">
                                        Ver Proyecto <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
