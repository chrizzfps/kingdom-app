import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
    Twitter,
    Instagram,
    Youtube,
    Music2,
    Copy,
    Check,
    Sparkles,
    ImageIcon,
    BookOpen,
    ArrowLeft,
    Film,
    Save,
    PenLine,
    Link as LinkIcon,
    Search,
    Wand2,
    ChevronRight,
    Loader2,
    History,
    Zap,
    Settings2 as SettingsIcon,
    Menu,
    Share2,
    Globe,
    Hash,
    ExternalLink
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getProjects } from '@/api/crm';
import { getBrandIdentity, updateBrandIdentity, savePost, getPosts, getSocialUrl, type BrandIdentity, type SocialPost } from '@/api/social';
import { KingdomAI } from '@/lib/gemini';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { SocialSidebar } from '@/components/admin/SocialSidebar';
import { CopyHistoryDetail } from '@/components/admin/CopyHistoryDetail';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SocialCenter() {
    const [view, setView] = useState<'projects' | 'dashboard' | 'wizard'>('projects');
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [currentProject, setCurrentProject] = useState<any>(null);
    const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);

    // UI States
    const [isEditingIdentity, setIsEditingIdentity] = useState(false);
    const [isAnalyzingSources, setIsAnalyzingSources] = useState(false);
    const [isSavingPost, setIsSavingPost] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [tempIdentity, setTempIdentity] = useState<BrandIdentity>({
        industry: '',
        tone: '',
        audience: '',
        context: '',
        sources: ''
    });

    // Wizard States
    const [step, setStep] = useState(1);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [videoLink, setVideoLink] = useState('');
    const [brief, setBrief] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
    const [selectedScript, setSelectedScript] = useState('');
    const [outputs, setOutputs] = useState<any>({});
    const [youtubeTab, setYoutubeTab] = useState<'long' | 'short'>('long');
    const [savedPosts, setSavedPosts] = useState<SocialPost[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedHistoryPost, setSelectedHistoryPost] = useState<SocialPost | null>(null);

    // Drag & Drop Handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            // Validate file type
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                setMediaFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setMediaPreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                toast.error('Solo se permiten archivos de imagen o video');
            }
        }
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                loadProjects();
            } else {
                setLoading(false);
                // Optionally redirect to login if not authenticated
            }
        });
        return () => unsubscribe();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar los proyectos.');
        } finally {
            setLoading(false);
        }
    };

    const selectProject = async (project: any) => {
        setLoading(true);
        setCurrentProject(project);
        try {
            const [identityResult, postsResult] = await Promise.all([
                getBrandIdentity(project.id),
                getPosts(project.id)
            ]);

            const identity = identityResult as any;
            const posts = postsResult as SocialPost[];

            const initialIdentity: BrandIdentity = identity || {
                industry: project.industry || '',
                tone: '',
                audience: '',
                context: project.description || '',
                sources: '',
                socialHandles: identity?.socialHandles || {
                    instagram: '',
                    tiktok: '',
                    youtube: '',
                    linkedin: '',
                    facebook: '',
                    website: ''
                }
            };

            setBrandIdentity(initialIdentity);
            setTempIdentity(initialIdentity);
            setSavedPosts(posts);
            setView('dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar la identidad de marca.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveIdentity = async () => {
        if (!currentProject) return;
        setLoading(true);
        try {
            await updateBrandIdentity(currentProject.id, tempIdentity);
            setBrandIdentity(tempIdentity);
            setIsEditingIdentity(false);
            toast.success('Identidad de marca actualizada.');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo guardar la identidad.');
        } finally {
            setLoading(false);
        }
    };

    const analyzeBrandSources = async () => {
        if (!tempIdentity.sources) return;
        setIsAnalyzingSources(true);
        const prompt = `Analiza el siguiente texto que contiene fuentes, URLs, notas o información de competencia sobre la marca "${currentProject.name}".
        
        FUENTES A ANALIZAR:
        "${tempIdentity.sources}"
        
        TAREA:
        Extrae un "Contexto de Marca" resumido y profesional que defina claramente qué hace la marca, su propuesta de valor única (USP) y sus pilares clave.
        El objetivo es usar este resumen para entrenar a una IA copywriter en el futuro.
        
        Salida: Solo el texto del resumen, sin introducciones.`;

        try {
            const summary = await KingdomAI.analyzeBrandVoice(prompt);
            const newContext = tempIdentity.context
                ? `${tempIdentity.context}\n\n--- ANÁLISIS DE FUENTES ---\n${summary}`
                : summary;
            setTempIdentity({ ...tempIdentity, context: newContext });
            toast.success('Identidad extraída correctamente.');
        } catch (error) {
            console.error(error);
            toast.error('Error al analizar fuentes.');
        } finally {
            setIsAnalyzingSources(false);
        }
    };

    const startNewPost = () => {
        setStep(1);
        setMediaFile(null);
        setMediaPreview(null);
        setVideoLink('');
        setBrief('');
        setAiSuggestions([]);
        setSelectedScript('');
        setOutputs({});
        setView('wizard');
    };

    const generateIdeas = async () => {
        setIsProcessing(true);
        const brandContext = {
            name: currentProject.name,
            industry: tempIdentity.industry || 'General',
            tone: tempIdentity.tone || 'Profesional',
            audience: tempIdentity.audience || 'Público General',
            context: tempIdentity.context || '',
            sources: tempIdentity.sources || ''
        };

        try {
            let mediaData;
            if (mediaPreview && mediaFile) {
                mediaData = {
                    mimeType: mediaFile.type,
                    data: mediaPreview.split(',')[1]
                };
            }

            const suggestions = await KingdomAI.generateCreativeSuggestions(
                brandContext,
                brief,
                mediaData
            );

            setAiSuggestions(suggestions);
            setStep(2);
        } catch (error) {
            console.error(error);
            toast.error('La IA no pudo procesar la solicitud.');
        } finally {
            setIsProcessing(false);
        }
    };

    const generatePlatformPosts = async () => {
        setIsProcessing(true);
        const brand = {
            name: currentProject.name,
            tone: tempIdentity.tone || 'Profesional',
            audience: tempIdentity.audience || 'Público General'
        };

        try {
            const posts = await KingdomAI.generateFinalPosts(
                brand,
                selectedScript
            );

            setOutputs(posts);
            setStep(3);
        } catch (error) {
            console.error(error);
            toast.error('Error al generar copys finales.');
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success('Copiado al portapapeles');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                toast.error('Archivo demasiado grande (>20MB).');
                return;
            }
            setMediaFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setMediaPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSidebarAction = (action: 'new-post' | 'back-to-dashboard') => {
        if (action === 'new-post') {
            startNewPost();
        } else if (action === 'back-to-dashboard') {
            setView('dashboard');
            setStep(1);
        }
    };

    if (loading && view === 'projects') return <KingdomLoader />;

    const showSidebar = view !== 'projects' && currentProject;

    return (
        <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-700">
            {/* Sidebar - Only when project is active */}
            {showSidebar && (
                <SocialSidebar
                    isCollapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    currentProject={currentProject}
                    currentView={view}
                    onAction={handleSidebarAction}
                    isMobileOpen={mobileSidebarOpen}
                    onMobileClose={() => setMobileSidebarOpen(false)}
                    socialHandles={brandIdentity?.socialHandles}
                />
            )}

            {/* Main Content */}
            <div className={cn(
                "transition-all duration-300",
                // No margin on mobile
                "ml-0",
                // Margin on desktop only
                showSidebar && (sidebarCollapsed ? "lg:ml-16" : "lg:ml-56")
            )}>
                {/* Navigation Bar */}
                <div className="border-b border-border bg-background sticky top-0 z-30 px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger - only show when sidebar should be visible */}
                        {showSidebar && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileSidebarOpen(true)}
                                className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        )}

                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('projects')}>
                            <Logo variant="isotipo" className="scale-90 group-hover:scale-100 transition-transform" />
                            <span className="font-bold text-xl tracking-tighter">SocialCenter</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {view !== 'projects' && (
                            <Button variant="ghost" size="sm" onClick={() => setView('projects')} className="text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Cambiar Proyecto
                            </Button>
                        )}
                        {view === 'projects' && (
                            <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'} className="rounded-xl font-medium">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Kingdom OS
                            </Button>
                        )}
                    </div>
                </div>

                <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
                    {view === 'projects' && (
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Mis Proyectos</h1>
                                <p className="text-muted-foreground mt-1">Gestiona la identidad de marca y genera contenido inteligente.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map(p => (
                                    <Card key={p.id} className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden border-border bg-card dark:bg-card/50 backdrop-blur-sm" onClick={() => selectProject(p)}>
                                        <CardHeader>
                                            <CardTitle className="text-xl flex items-center justify-between">
                                                {p.name}
                                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </CardTitle>
                                            <CardDescription className="line-clamp-1">{p.industry || 'Industria no definida'}</CardDescription>
                                        </CardHeader>
                                        <CardFooter className="text-xs text-muted-foreground border-t border-border/50 py-3 bg-muted/20">
                                            <SettingsIcon className="w-3 h-3 mr-2" /> Configurar Identidad
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'dashboard' && currentProject && (
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border border-border relative overflow-hidden transition-colors duration-500">
                                {/* Ambient light for the dark banner */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

                                <div className="z-10 text-center md:text-left">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                        <h1 className="text-4xl font-black tracking-tight">{currentProject.name}</h1>
                                        <Badge variant="outline" className="uppercase border-background/20 text-background bg-background/10 backdrop-blur-md">
                                            {currentProject.industry}
                                        </Badge>
                                    </div>
                                    <p className="text-background/70 text-base max-w-2xl line-clamp-2 leading-relaxed">
                                        {brandIdentity?.context || currentProject.description || "Gestiona el contenido de tu marca con inteligencia artificial."}
                                    </p>
                                </div>

                                <Button
                                    size="lg"
                                    className="z-10 h-14 px-8 bg-white text-black dark:bg-black dark:text-white hover:opacity-90 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
                                    onClick={startNewPost}
                                >
                                    <Sparkles className="w-5 h-5 mr-2" /> Crear Nuevo Post
                                </Button>
                            </div>

                            <Tabs defaultValue="history" className="w-full">
                                <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-1">
                                    <TabsList className="bg-muted/50 p-1 border border-border/50">
                                        <TabsTrigger
                                            value="history"
                                            className="px-6 py-2 rounded-lg transition-all flex items-center gap-2 font-bold"
                                        >
                                            <History className="w-4 h-4" /> Historial
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="identity"
                                            className="px-6 py-2 rounded-lg transition-all flex items-center gap-2 font-bold"
                                        >
                                            <BookOpen className="w-4 h-4" /> Identidad de Marca
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="identity" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center bg-card/50 p-4 rounded-2xl border border-border mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold">Knowledge Base</h2>
                                                <p className="text-xs text-muted-foreground">Define la voz y el contexto de tu marca</p>
                                            </div>
                                        </div>
                                        {!isEditingIdentity ? (
                                            <Button variant="outline" size="sm" onClick={() => setIsEditingIdentity(true)} className="rounded-xl">
                                                <PenLine className="w-4 h-4 mr-2" /> Editar Identidad
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => { setIsEditingIdentity(false); setTempIdentity(brandIdentity!); }} className="rounded-xl">Cancelar</Button>
                                                <button
                                                    onClick={handleSaveIdentity}
                                                    style={{ backgroundColor: 'black', color: 'white' }}
                                                    className="inline-flex items-center justify-center h-9 px-6 rounded-xl hover:opacity-90 font-medium text-sm transition-all hover:scale-[1.02] [.dark_&]:!bg-white [.dark_&]:!text-black"
                                                >
                                                    <Save className="w-4 h-4 mr-2" /> Guardar
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="border-border bg-card dark:bg-card/30 backdrop-blur-sm rounded-3xl">
                                            <CardContent className="pt-6 space-y-4">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tono de Voz</label>
                                                    {isEditingIdentity ? (
                                                        <Input className="bg-background/50 border-border rounded-xl" value={tempIdentity.tone} onChange={e => setTempIdentity({ ...tempIdentity, tone: e.target.value })} placeholder="Ej: Profesional, irreverente, cercano..." />
                                                    ) : (
                                                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                                                            <p className="text-foreground text-sm font-medium">{brandIdentity?.tone || 'Aún no definido'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Audiencia</label>
                                                    {isEditingIdentity ? (
                                                        <Input className="bg-background/50 border-border rounded-xl" value={tempIdentity.audience} onChange={e => setTempIdentity({ ...tempIdentity, audience: e.target.value })} placeholder="Ej: Dueños de agencia, marketers..." />
                                                    ) : (
                                                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                                                            <p className="text-foreground text-sm font-medium">{brandIdentity?.audience || 'Aún no definida'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border bg-card dark:bg-card/30 backdrop-blur-sm rounded-3xl">
                                            <CardContent className="pt-6 space-y-4 h-full flex flex-col">
                                                <div className="space-y-3 flex-grow h-full flex flex-col">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contexto de Marca</label>
                                                    {isEditingIdentity ? (
                                                        <Textarea className="flex-grow bg-background/50 border-border rounded-xl resize-none min-h-[150px]" value={tempIdentity.context} onChange={e => setTempIdentity({ ...tempIdentity, context: e.target.value })} placeholder="Describe la propuesta de valor y pilares de la marca..." />
                                                    ) : (
                                                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex-grow overflow-y-auto max-h-[150px]">
                                                            <p className="text-muted-foreground text-sm leading-relaxed">{brandIdentity?.context || 'Sube fuentes para analizar o describe tu marca aquí.'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="md:col-span-2 overflow-hidden relative border-border bg-card dark:bg-card/30 backdrop-blur-sm rounded-3xl">
                                            <CardHeader>
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                    <div>
                                                        <CardTitle className="text-lg">Fuentes y Recursos</CardTitle>
                                                        <CardDescription>Pega URLs o notas para entrenar a la IA con tu voz real.</CardDescription>
                                                    </div>
                                                    {isEditingIdentity && (
                                                        <Button variant="secondary" size="sm" onClick={analyzeBrandSources} disabled={isAnalyzingSources || !tempIdentity.sources} className="rounded-xl border border-border">
                                                            {isAnalyzingSources ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Zap className="w-3 h-3 mr-2 text-primary" />} Analizar con IA
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {isEditingIdentity ? (
                                                    <Textarea className="h-32 font-mono text-xs bg-background/50 border-border rounded-xl" value={tempIdentity.sources} onChange={e => setTempIdentity({ ...tempIdentity, sources: e.target.value })} placeholder="Ej: www.nuestraweb.com o 'Somos una empresa que se dedica a...'" />
                                                ) : (
                                                    <div className="h-24 overflow-y-auto text-xs font-mono text-muted-foreground/60 bg-muted/20 p-4 rounded-xl border border-border/30">
                                                        {brandIdentity?.sources || 'No hay fuentes definidas en este momento.'}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border bg-card dark:bg-card/30 backdrop-blur-sm rounded-3xl">
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Share2 className="w-5 h-5 text-primary" /> Redes Sociales
                                                </CardTitle>
                                                <CardDescription>Enlaces a tus perfiles para acceso rápido.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {['instagram', 'tiktok', 'youtube', 'linkedin', 'facebook', 'website'].map((platform) => (
                                                        <div key={platform} className="space-y-2">
                                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                                {platform === 'website' ? <Globe className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
                                                                {platform}
                                                            </label>
                                                            {isEditingIdentity ? (
                                                                <Input
                                                                    className="bg-background/50 border-border rounded-xl"
                                                                    placeholder={platform === 'website' ? "ej: kingdomagency.es" : "Usuario / Handle (sin @)"}
                                                                    value={tempIdentity.socialHandles?.[platform as keyof typeof tempIdentity.socialHandles] || ''}
                                                                    onChange={e => setTempIdentity({
                                                                        ...tempIdentity,
                                                                        socialHandles: {
                                                                            ...tempIdentity.socialHandles,
                                                                            [platform]: e.target.value
                                                                        }
                                                                    })}
                                                                />
                                                            ) : (
                                                                <div className="p-3 rounded-xl bg-muted/30 border border-border/50 truncate">
                                                                    {brandIdentity?.socialHandles?.[platform as keyof typeof brandIdentity.socialHandles] ? (
                                                                        <a
                                                                            href={getSocialUrl(platform, brandIdentity.socialHandles[platform as keyof typeof brandIdentity.socialHandles]!)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
                                                                        >
                                                                            <ExternalLink className="w-3 h-3" />
                                                                            {brandIdentity.socialHandles[platform as keyof typeof brandIdentity.socialHandles]}
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-sm text-muted-foreground italic">No configurado</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="history" className="space-y-4 animate-in fade-in">
                                    {savedPosts.length === 0 ? (
                                        <Card className="border-dashed h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 border-2">
                                            <Search className="w-8 h-8 opacity-20 mb-4" />
                                            <p>Tu historial de publicaciones aparecerá aquí.</p>
                                        </Card>
                                    ) : (
                                        <div className="space-y-4">
                                            {savedPosts.map((post) => (
                                                <Card
                                                    key={post.id}
                                                    className="border-border bg-card dark:bg-card/30 backdrop-blur-sm rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer"
                                                    onClick={() => setSelectedHistoryPost(post)}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-grow">
                                                            <p className="text-xs text-muted-foreground mb-2">
                                                                {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Fecha desconocida'}
                                                            </p>
                                                            <p className="font-bold text-foreground mb-1 line-clamp-1">{post.brief || 'Sin briefing'}</p>
                                                            <p className="text-sm text-muted-foreground line-clamp-2">{post.selectedIdea}</p>
                                                        </div>
                                                        <Badge variant="secondary" className="shrink-0">5 Copys</Badge>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {view === 'wizard' && currentProject && (
                        <div className="max-w-4xl mx-auto space-y-12">
                            <div className="flex items-center justify-center space-x-12">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black transition-all duration-300",
                                            step === s ? "btn-contrast-forced scale-110" : step > s ? "bg-green-500 text-white" : "bg-muted text-muted-foreground/50"
                                        )}>
                                            {step > s ? <Check className="w-5 h-5" /> : `0${s}`}
                                        </div>
                                        <span className={cn("text-sm font-bold tracking-tight uppercase", step === s ? "text-foreground" : "text-muted-foreground/50")}>
                                            {s === 1 ? 'Concepto' : s === 2 ? 'Estrategia' : 'Canales'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {step === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-500">
                                    <div className="space-y-6">
                                        <div
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={cn(
                                                "relative h-80 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
                                                isDragging
                                                    ? "border-brand-blue bg-brand-blue/10 scale-[1.02]"
                                                    : "border-border hover:border-brand-blue/50 hover:bg-muted/30"
                                            )}
                                        >
                                            <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                                            {mediaPreview ? (
                                                mediaFile?.type.startsWith('video') ?
                                                    <video src={mediaPreview} className="w-full h-full object-cover rounded-3xl" controls /> :
                                                    <img src={mediaPreview} className="w-full h-full object-cover rounded-3xl" alt="Preview" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-4">
                                                    <div className="flex justify-center gap-4 text-brand-blue/30">
                                                        <ImageIcon className="w-12 h-12" />
                                                        <Film className="w-12 h-12" />
                                                    </div>
                                                    <p className="font-bold">
                                                        {isDragging ? 'Suelta el archivo aquí' : 'Subir Referencia Visual'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {isDragging
                                                            ? 'Suelta para cargar el archivo'
                                                            : 'Arrastra y suelta o haz clic para seleccionar'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        La IA analizará el video o imagen para el copy.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                value={videoLink}
                                                onChange={e => setVideoLink(e.target.value)}
                                                placeholder="O pega link de YouTube/Video..."
                                                className="h-14 pl-12 bg-muted/50 dark:bg-muted/20 border-border rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex flex-col justify-center">
                                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs flex items-center gap-3 text-primary font-medium">
                                            <Sparkles className="w-5 h-5 shrink-0" />
                                            <span>IA activa usando tono <strong>"{tempIdentity.tone || 'Estándar'}"</strong></span>
                                        </div>
                                        <Textarea
                                            value={brief}
                                            onChange={e => setBrief(e.target.value)}
                                            placeholder="¿Qué quieres anunciar o mostrar hoy?"
                                            className="h-48 rounded-3xl border-border bg-card dark:bg-card/50 backdrop-blur-md p-6 resize-none focus:ring-primary text-lg"
                                        />
                                        <button
                                            style={{ backgroundColor: 'black', color: 'white' }}
                                            className="inline-flex items-center justify-center h-16 w-full px-8 rounded-2xl hover:opacity-90 font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed [.dark_&]:!bg-white [.dark_&]:!text-black"
                                            disabled={isProcessing}
                                            onClick={generateIdeas}
                                        >
                                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                                            Explorar Enfoques Creativos
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold">Selecciona una Estrategia</h2>
                                        <p className="text-muted-foreground">Elige el enfoque que mejor se adapte a tu objetivo actual.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {aiSuggestions.map((s, i) => (
                                            <Card
                                                key={i}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:scale-[1.02] border-border bg-card dark:bg-card/30 backdrop-blur-sm rounded-3xl p-2",
                                                    selectedScript === s.content ? "ring-2 ring-primary border-transparent bg-primary/5" : "hover:border-primary/50"
                                                )}
                                                onClick={() => setSelectedScript(s.content)}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-xl font-black">{s.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                                    {s.content}
                                                </CardContent>
                                                <CardFooter>
                                                    <Badge variant="secondary" className="text-[10px] font-mono tracking-tighter bg-primary/10 text-primary border-none uppercase px-3 py-1">
                                                        {s.tone_check}
                                                    </Badge>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                    <button
                                        disabled={!selectedScript || isProcessing}
                                        onClick={generatePlatformPosts}
                                        style={{ backgroundColor: 'black', color: 'white' }}
                                        className="inline-flex items-center justify-center h-14 px-12 rounded-2xl hover:opacity-90 font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed [.dark_&]:!bg-white [.dark_&]:!text-black"
                                    >
                                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Generar Copys Finales"} <ChevronRight className="ml-2 w-4 h-4" />
                                    </button>
                                </div>

                            )}

                            {step === 3 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20 animate-in fade-in">
                                    {[
                                        { id: 'instagram', name: 'Instagram', icon: Instagram },
                                        { id: 'x', name: 'X / Twitter', icon: Twitter },
                                        { id: 'tiktok', name: 'TikTok', icon: Music2 },
                                        { id: 'youtube', name: 'YouTube', icon: Youtube },
                                    ].map((p) => {
                                        const isYoutube = p.id === 'youtube';
                                        const content = isYoutube ? (youtubeTab === 'long' ? outputs.youtube_long : outputs.youtube_short) : outputs[p.id];
                                        return (
                                            <Card key={p.id} className="overflow-hidden flex flex-col border-border bg-card dark:bg-card/30 backdrop-blur-sm rounded-3xl ring-1 ring-white/5">
                                                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 bg-muted/20">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-background rounded-xl border border-border"><p.icon className="w-4 h-4 text-primary" /></div>
                                                        <span className="font-bold tracking-tight">{p.name}</span>
                                                    </div>
                                                    {isYoutube && (
                                                        <div className="flex gap-1 p-1 bg-background/50 border border-border rounded-xl">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={cn(
                                                                    "h-7 text-[10px] font-bold px-3 rounded-lg transition-all",
                                                                    youtubeTab === 'long' ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" : "hover:bg-muted"
                                                                )}
                                                                onClick={() => setYoutubeTab('long')}
                                                            >
                                                                Long
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={cn(
                                                                    "h-7 text-[10px] font-bold px-3 rounded-lg transition-all",
                                                                    youtubeTab === 'short' ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" : "hover:bg-muted"
                                                                )}
                                                                onClick={() => setYoutubeTab('short')}
                                                            >
                                                                Shorts
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="pt-6 flex-grow">
                                                    <Textarea
                                                        value={content}
                                                        spellCheck={false}
                                                        onChange={e => {
                                                            const newVal = e.target.value;
                                                            if (isYoutube) {
                                                                setOutputs({ ...outputs, [youtubeTab === 'long' ? 'youtube_long' : 'youtube_short']: newVal });
                                                            } else {
                                                                setOutputs({ ...outputs, [p.id]: newVal });
                                                            }
                                                        }}
                                                        className="h-48 border-none bg-transparent resize-none font-sans text-base p-0 focus-visible:ring-0 leading-relaxed"
                                                    />
                                                </CardContent>
                                                <CardFooter className="pt-4 border-t border-border/50 bg-muted/10">
                                                    <Button variant="outline" className="w-full flex items-center gap-2 rounded-xl bg-background hover:bg-muted border-border font-bold" onClick={() => copyToClipboard(content, p.id)}>
                                                        {copiedId === p.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} Copiar Contenido
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        );
                                    })}

                                    {/* Save Button */}
                                    <div className="md:col-span-2 flex justify-center pt-8">
                                        <button
                                            style={{ backgroundColor: 'black', color: 'white' }}
                                            className="w-full inline-flex items-center justify-center h-16 rounded-2xl hover:opacity-90 font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed [.dark_&]:!bg-white [.dark_&]:!text-black"
                                            disabled={isSavingPost}
                                            onClick={async () => {
                                                setIsSavingPost(true);
                                                try {
                                                    await savePost(currentProject.id, {
                                                        brief,
                                                        selectedIdea: selectedScript,
                                                        allSuggestions: aiSuggestions.map(s => s.script),
                                                        outputs,
                                                    });
                                                    // Refresh posts list so history shows immediately
                                                    const updatedPosts = await getPosts(currentProject.id);
                                                    setSavedPosts(updatedPosts);
                                                    toast.success('¡Post guardado en el historial!');
                                                    setView('dashboard');
                                                    setStep(1);
                                                } catch (error) {
                                                    console.error(error);
                                                    toast.error('Error al guardar el post.');
                                                } finally {
                                                    setIsSavingPost(false);
                                                }
                                            }}
                                        >
                                            {isSavingPost ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                            Guardar en Historial
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <CopyHistoryDetail
                    post={selectedHistoryPost}
                    open={!!selectedHistoryPost}
                    onOpenChange={(open) => !open && setSelectedHistoryPost(null)}
                />
            </div>
        </div>
    );
}
