import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/Logo';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (user && !loading) {
            navigate('/admin');
        }
    }, [user, loading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Bienvenido a Kingdom Agency OS');
            navigate('/admin');
        } catch (err: any) {
            const message = err.code === 'auth/invalid-credential'
                ? 'Credenciales incorrectas'
                : 'Error al iniciar sesión';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans antialiased">

            {/* ── Left: Brand panel ─────────────────────────────── */}
            <aside
                className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col relative overflow-hidden select-none"
                style={{ backgroundColor: '#0d0d0d' }}
            >
                {/* Dot grid */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
                        backgroundSize: '26px 26px',
                    }}
                />
                {/* Radial fade from center */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(ellipse 80% 60% at 40% 50%, transparent 20%, #0d0d0d 100%)',
                    }}
                />

                <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
                    {/* Top */}
                    <Logo mode="light" className="h-8" />

                    {/* Middle */}
                    <div className="flex-1 flex flex-col justify-end pb-14">
                        <div className="space-y-5">
                            <div className="w-6 h-px bg-zinc-600" />
                            <p
                                className="text-white font-semibold leading-[1.15] tracking-tight"
                                style={{ fontSize: 'clamp(1.6rem, 2.4vw, 2.25rem)' }}
                            >
                                Tu estudio.<br />
                                Un solo sistema.
                            </p>
                            <p className="text-zinc-500 text-sm leading-relaxed max-w-[240px]">
                                Gestión de proyectos, clientes y propuestas en un solo lugar.
                            </p>
                        </div>
                    </div>

                    {/* Bottom metadata */}
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-700 text-[11px] font-mono tracking-widest uppercase">
                            v2.0
                        </span>
                        <span className="text-zinc-700 text-[11px] tracking-wide">
                            © {new Date().getFullYear()} Kingdom Agency
                        </span>
                    </div>
                </div>
            </aside>

            {/* ── Right: Form panel ─────────────────────────────── */}
            <main
                className="flex-1 flex flex-col"
                style={{ backgroundColor: '#fafaf9' }}
            >
                {/* Mobile top bar */}
                <div className="lg:hidden flex items-center px-6 sm:px-10 py-6 border-b border-zinc-200/60">
                    <Logo mode="dark" className="h-7" />
                </div>

                {/* Form area */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pb-10">
                    <div className="w-full max-w-[360px]">

                        {/* Heading */}
                        <div className="mb-11">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.22em] font-medium mb-3">
                                Acceso al sistema
                            </p>
                            <h1 className="text-[2.1rem] font-semibold text-zinc-950 tracking-[-0.02em] leading-[1.1]">
                                Inicia sesión
                            </h1>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} noValidate>

                            {/* Email */}
                            <div className="mb-8">
                                <label
                                    htmlFor="email"
                                    className="block text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-medium mb-3"
                                >
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="nombre@kingdom.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    className="
                                        w-full bg-transparent border-0 border-b border-zinc-300
                                        focus:border-zinc-900 focus:outline-none
                                        py-2.5 text-[0.9rem] text-zinc-900
                                        placeholder:text-zinc-300
                                        transition-colors duration-200
                                        rounded-none
                                    "
                                />
                            </div>

                            {/* Password */}
                            <div className="mb-10">
                                <label
                                    htmlFor="password"
                                    className="block text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-medium mb-3"
                                >
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="
                                        w-full bg-transparent border-0 border-b border-zinc-300
                                        focus:border-zinc-900 focus:outline-none
                                        py-2.5 text-[0.9rem] text-zinc-900
                                        placeholder:text-zinc-300
                                        transition-colors duration-200
                                        rounded-none
                                    "
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="
                                    w-full h-11 bg-zinc-950 text-white
                                    text-[0.8rem] font-medium tracking-[0.06em] uppercase
                                    hover:bg-zinc-800
                                    disabled:opacity-40 disabled:cursor-not-allowed
                                    transition-colors duration-200
                                    flex items-center justify-center gap-2.5
                                    rounded-none
                                "
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Verificando</span>
                                    </>
                                ) : (
                                    'Continuar'
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="mt-12 text-[11px] text-zinc-300 text-center leading-relaxed">
                            Acceso exclusivo para miembros del equipo.
                        </p>
                    </div>
                </div>
            </main>

        </div>
    );
}
