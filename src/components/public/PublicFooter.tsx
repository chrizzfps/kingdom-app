import { Logo } from '@/components/shared/Logo';

export function PublicFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full min-h-[100dvh] flex flex-col items-center justify-center snap-start bg-zinc-950 relative overflow-hidden px-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(255,255,255,0.03),transparent)] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-xl text-center">

                <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
                        <Logo variant="isotipo" mode="light" className="h-8 w-auto" />
                    </div>
                    <p className="text-zinc-600 text-xs tracking-[0.18em] uppercase font-medium">Kingdom Agency</p>
                </div>

                <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                <div className="flex flex-col items-center gap-2">
                    <p className="text-zinc-300 text-lg font-medium tracking-tight">¿Tienes alguna pregunta?</p>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                        Estamos disponibles para aclarar cualquier duda sobre esta propuesta.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                        href="https://wa.me/message/LSNNLXHFGYBCN1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 text-sm font-medium hover:bg-zinc-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                    </a>
                    <a
                        href="mailto:contactokingdom.ve@gmail.com"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-zinc-300 text-sm font-medium hover:border-white/25 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        Email
                    </a>
                </div>

                <p className="text-zinc-700 text-[10px] font-mono tracking-widest uppercase mt-4">
                    © {year} Kingdom Agency · Todos los derechos reservados
                </p>

            </div>
        </footer>
    );
}
