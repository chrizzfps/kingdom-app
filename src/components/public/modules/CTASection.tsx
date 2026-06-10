import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProposalModule } from '@/types/proposal';
import { AnimatedTitle } from '../common/AnimatedTitle';

// --- PARTICLE SYSTEM (White Theme Adapted) ---
const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let mouse = { x: -1000, y: -1000 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            baseX: number;
            baseY: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.baseX = this.x;
                this.baseY = this.y;
                // Slow motion but smooth (60fps target via requestAnimationFrame)
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.size = Math.random() * 2 + 0.5;
            }

            update() {
                // Mouse Interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 200;

                if (distance < maxDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDistance - distance) / maxDistance;
                    const repelStrength = 0.5;

                    this.vx -= forceDirectionX * force * repelStrength * 0.1;
                    this.vy -= forceDirectionY * force * repelStrength * 0.1;
                }

                this.x += this.vx;
                this.y += this.vy;

                // Infinite wrapping
                if (this.x < 0) this.x = canvas!.width;
                if (this.x > canvas!.width) this.x = 0;
                if (this.y < 0) this.y = canvas!.height;
                if (this.y > canvas!.height) this.y = 0;
            }

            draw() {
                if (!ctx) return;
                // Darker particles to be visible
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            const particleCount = Math.min(Math.floor(window.innerWidth / 20), 80);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        // Darker lines to be visible
                        ctx.strokeStyle = `rgba(0, 0, 0, ${0.15 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
                particles[i].update();
                particles[i].draw();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', onMouseMove);

        resize();
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            animate();
        }

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// --- COMPONENT ---
export function CTASection({ module }: { module: ProposalModule }) {
    const { title, buttonText, buttonLink, whatsapp, email, whatsappMessage } = module.data;

    const displayTitle = title || "¿Listo para empezar?";
    const displayBtn = buttonText;
    const link = buttonLink || '#';
    const waHref = whatsapp
        ? `https://wa.me/${whatsapp.replace(/\D/g, '')}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ''}`
        : null;

    return (
        <section className="relative w-full min-h-[100dvh] flex items-center bg-white text-zinc-900 overflow-hidden py-20 snap-start">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <ParticleBackground />
            </div>

            <div className="container relative z-10 mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 w-full max-w-7xl mx-auto">

                    {/* LEFT: Title */}
                    <div className="flex-1 text-left w-full break-words">
                        <AnimatedTitle text={displayTitle} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-zinc-900 leading-[1.05] break-words hyphens-auto w-full" />
                    </div>

                    {/* RIGHT: Buttons */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 shrink-0"
                    >
                        {/* Main Custom Button (Black -> Transparent with Border) */}
                        {displayBtn && (
                            <Button
                                size="lg"
                                className="h-13 px-8 text-base rounded-full bg-zinc-900 text-white border border-zinc-900 hover:bg-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                                asChild
                            >
                                <a href={link} target="_blank" rel="noopener noreferrer">
                                    <span className="mr-2">{displayBtn}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                            </Button>
                        )}

                        {/* WhatsApp Button */}
                        {waHref && (
                            <Button
                                size="lg"
                                className="h-13 px-8 text-base rounded-full bg-zinc-900 text-white border border-zinc-900 hover:bg-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                                asChild
                            >
                                <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                                    WhatsApp
                                </a>
                            </Button>
                        )}

                        {/* Email Button (Transparent -> Black) */}
                        {email && (
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-13 px-8 text-base rounded-full border-zinc-900 bg-transparent text-zinc-900 hover:bg-zinc-900 hover:text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5"
                                asChild
                            >
                                <a href={`mailto:${email}`} aria-label="Email">
                                    Email
                                </a>
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
