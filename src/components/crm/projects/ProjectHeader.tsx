import type { Project, Client } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, User } from 'lucide-react';

interface ProjectHeaderProps {
    project: Project;
    client?: Client;
}

export function ProjectHeader({ project, client }: ProjectHeaderProps) {
    return (
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-3 md:p-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-0 md:p-6 md:pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">Estado</CardTitle>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-[10px] md:text-xs">
                        {project.status.toUpperCase()}
                    </Badge>
                </CardHeader>
                <CardContent className="p-0 md:p-6 md:pt-0 mt-2 md:mt-0">
                    <div className="text-lg md:text-2xl font-bold truncate">{project.name}</div>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{client?.name || 'Cliente desconocido'}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deadline</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {project.deadline ? project.deadline.toLocaleDateString() : 'Sin fecha'}
                    </div>
                    <p className="text-xs text-muted-foreground">Fecha de entrega</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Presupuesto</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: project.currency || 'EUR' }).format(project.budget || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total estimado</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Equipo</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{project.teamIds?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Miembros asignados</p>
                </CardContent>
            </Card>
        </div>
    );
}
