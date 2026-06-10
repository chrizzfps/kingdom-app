import { useState, useEffect } from 'react';
import { getProjects, getClients } from '@/api/crm';
import type { Project, Client } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FolderKanban, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { ProjectDialog } from '@/components/crm/ProjectDialog';
import { Badge } from '@/components/ui/badge';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const navigate = useNavigate();

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [pData, cData] = await Promise.all([
                getProjects(),
                getClients()
            ]);
            setProjects(pData);
            setClients(cData);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = () => {
        setSelectedProject(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation(); // Prevent navigation
        setSelectedProject(project);
        setIsDialogOpen(true);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <KingdomLoader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    {/* Minimalist: Removed Title and Description */}
                </div>
                <Button onClick={handleCreate} variant="contrast">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar proyectos..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                    <Card key={project.id} className="group cursor-pointer hover:border-brand-blue/50 transition-all hover:shadow-lg" onClick={() => navigate(`/admin/projects/${project.id}`)}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-lg font-bold group-hover:text-brand-blue transition-colors">{project.name}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {clients.find(c => c.id === project.clientId)?.name || 'Cliente desconocido'}
                                </p>
                            </div>
                            <Badge variant={
                                project.status === 'active' ? 'default' :
                                    project.status === 'completed' ? 'secondary' : 'outline'
                            }>
                                {project.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                {project.description || 'Sin descripción...'}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center text-xs text-muted-foreground gap-4">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" />
                                        <span>{project.createdAt?.toLocaleDateString()}</span>
                                    </div>
                                    {project.deadline && (
                                        <div className="flex items-center gap-1 text-orange-400">
                                            <FolderKanban className="h-3 w-3" />
                                            <span>Due: {project.deadline.toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={(e) => handleEdit(e, project)}>
                                    Editar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ProjectDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                project={selectedProject}
                clients={clients}
                onSuccess={() => loadData(true)}
            />
        </div>
    );
}
