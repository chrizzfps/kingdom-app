import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { Proposal, ProposalModule } from '@/types/proposal';
import { ModuleRenderer } from '@/components/public/ModuleRenderer';
import { ProgressNav } from '@/components/public/ProgressNav';
import { SEO } from '@/components/common/SEO';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function PublicProposalView() {
    const { slug } = useParams<{ slug: string }>();
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [modules, setModules] = useState<ProposalModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!slug) return;
            try {
                const { getPublicProposal } = await import('@/api/proposals');
                const data = await getPublicProposal(slug);
                if (data) {
                    setProposal(data);
                    const { getModules } = await import('@/api/modules');
                    const mods = await getModules(data.id);
                    setModules(mods);
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error(e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slug]);

    if (loading) return <KingdomLoader />;

    if (error || !proposal) return (
        <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-zinc-950 text-white">
            <span className="text-5xl font-semibold tracking-tight">404</span>
            <p className="text-zinc-400 text-sm">Esta propuesta no existe o no está disponible.</p>
        </div>
    );

    const heroModule = modules.find(m => m.type === 'HERO');
    const introModule = modules.find(m => m.type === 'INTRO');
    const pageTitle = (proposal?.title as string | undefined) || heroModule?.data?.title || 'Propuesta Comercial';
    const pageDescription = introModule?.data?.description?.slice(0, 160) || 'Propuesta exclusiva de Kingdom Agency.';
    const pageImage = heroModule?.data?.backgroundImage || undefined;

    return (
        <SlideViewer
            modules={modules}
            pageTitle={pageTitle}
            pageDescription={pageDescription}
            pageImage={pageImage}
        />
    );
}

function SlideViewer({ modules, pageTitle, pageDescription, pageImage }: {
    modules: ProposalModule[];
    pageTitle: string;
    pageDescription: string;
    pageImage: string | undefined;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const indexRef = useRef(0);
    const lockedRef = useRef(false);
    const touchStartRef = useRef<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const totalSlides = modules.length + 1; // +1 for footer

    const goTo = (next: number) => {
        if (lockedRef.current) return;
        const c = containerRef.current;
        if (!c) return;
        const target = Math.min(Math.max(next, 0), totalSlides - 1);
        if (target === indexRef.current) return;

        lockedRef.current = true;
        indexRef.current = target;
        setActiveIndex(target);

        const el = c.children.item(target) as HTMLElement | null;
        if (el) c.scrollTo({ top: el.offsetTop, behavior: 'smooth' });

        setTimeout(() => { lockedRef.current = false; }, 750);
    };

    // Wheel: passive:false so preventDefault works
    useEffect(() => {
        const c = containerRef.current;
        if (!c) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (Math.abs(e.deltaY) < 8) return;
            goTo(indexRef.current + (e.deltaY > 0 ? 1 : -1));
        };
        c.addEventListener('wheel', onWheel, { passive: false });
        return () => c.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalSlides]);

    // Touch swipe
    useEffect(() => {
        const c = containerRef.current;
        if (!c) return;
        const onStart = (e: TouchEvent) => { touchStartRef.current = e.touches[0].clientY; };
        const onEnd = (e: TouchEvent) => {
            if (touchStartRef.current === null) return;
            const delta = touchStartRef.current - e.changedTouches[0].clientY;
            touchStartRef.current = null;
            if (Math.abs(delta) < 40) return;
            goTo(indexRef.current + (delta > 0 ? 1 : -1));
        };
        c.addEventListener('touchstart', onStart, { passive: true });
        c.addEventListener('touchend', onEnd, { passive: true });
        return () => {
            c.removeEventListener('touchstart', onStart);
            c.removeEventListener('touchend', onEnd);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalSlides]);

    // Keyboard arrows
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(indexRef.current + 1); }
            else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goTo(indexRef.current - 1); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalSlides]);

    // Hero "Ver ahora" button fires this to advance to next slide
    useEffect(() => {
        const handler = () => goTo(indexRef.current + 1);
        window.addEventListener('proposal:next-slide', handler);
        return () => window.removeEventListener('proposal:next-slide', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalSlides]);

    return (
        <div className="public-proposal-theme">
            <SEO title={pageTitle} description={pageDescription} image={pageImage} />
            {/* overflow-hidden: browser cannot scroll at all, only JS controls position */}
            <div
                ref={containerRef}
                className="h-[100dvh] w-full overflow-hidden"
            >
                {modules.map(module => (
                    <ModuleRenderer key={module.id} module={module} allModules={modules} />
                ))}
                <PublicFooter />
            </div>
            <ProgressNav
                count={modules.filter(m => m.isVisible).length}
                active={activeIndex}
                onJump={goTo}
            />
        </div>
    );
}
