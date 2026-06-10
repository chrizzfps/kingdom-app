import type { ProposalModule } from '@/types/proposal';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper for Social Buttons
const SocialButton = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
    <Button
        variant="outline"
        size="icon"
        asChild
        className="rounded-full w-12 h-12 border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-110"
    >
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            {icon}
        </a>
    </Button>
);

// ... icons ...
const InstagramIcon = () => <Instagram className="w-5 h-5" />;
const LinkedinIcon = () => <Linkedin className="w-5 h-5" />;
const GlobeIcon = () => <Globe className="w-5 h-5" />;
const BehanceIcon = () => <Palette className="w-5 h-5" />;

interface Props {
    module: ProposalModule;
}

export function PortfolioHeroSection({ module }: Props) {
    const data = module.data || {};
    const { title, subtitle, backgroundImageUrl } = data;

    const overlayOpacity = (data.overlayOpacity ?? 30) / 100;
    const overlayBlur = data.overlayBlur ?? 0;

    return (
        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-black transition-colors duration-500 snap-start">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                {backgroundImageUrl ? (
                    <>
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            src={backgroundImageUrl}
                            alt="Portfolio Background"
                            className="w-full h-full object-cover transition-all duration-700"
                            style={{ filter: `blur(${overlayBlur}px)` }}
                        />

                        {/* THEME OVERLAYS - FORCED DARK */}
                        {/* Dark Mode Overlay */}
                        <div
                            className="absolute inset-0 bg-black transition-opacity duration-500"
                            style={{ opacity: overlayOpacity }}
                        />

                        {/* Tint Gradient - Visible for richness */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 mix-blend-overlay opacity-100 transition-opacity duration-500" />
                    </>
                ) : (
                    <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black" />
                )}
            </div>

            <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-8xl font-semibold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 transition-all duration-500">
                            {title || 'Mi Portafolio'}
                        </h1>
                    </motion.div>

                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-lg md:text-3xl text-zinc-300 font-normal tracking-tight max-w-2xl mx-auto"
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    {/* Divider */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100px" }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto rounded-full my-8"
                    />

                    {/* Social Links */}
                    {(data.showSocialLinks !== false && data.socialLinks) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="flex items-center justify-center gap-6 mt-10"
                        >
                            {data.socialLinks.instagram && (
                                <SocialButton href={data.socialLinks.instagram} icon={<InstagramIcon />} label="Instagram" />
                            )}
                            {data.socialLinks.linkedin && (
                                <SocialButton href={data.socialLinks.linkedin} icon={<LinkedinIcon />} label="LinkedIn" />
                            )}
                            {data.socialLinks.behance && (
                                <SocialButton href={data.socialLinks.behance} icon={<BehanceIcon />} label="Behance" />
                            )}
                            {data.socialLinks.website && (
                                <SocialButton href={data.socialLinks.website} icon={<GlobeIcon />} label="Website" />
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
