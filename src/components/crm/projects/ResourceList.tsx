import { useState, useEffect } from 'react';
import { getResources, createResource, deleteResource } from '@/api/crm';
import type { ProjectResource } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { File, Link as LinkIcon, ExternalLink, Trash2, Plus, HardDrive, Figma } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface ResourceListProps {
    projectId: string;
}

export function ResourceList({ projectId }: ResourceListProps) {
    const [resources, setResources] = useState<ProjectResource[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm<Partial<ProjectResource>>({
        defaultValues: { type: 'link' }
    });

    const loadResources = async () => {
        try {
            const data = await getResources(projectId);
            setResources(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { loadResources(); }, [projectId]);

    const onSubmit = async (data: any) => {
        try {
            await createResource({ ...data, projectId });
            toast.success('Recurso añadido');
            setIsDialogOpen(false);
            reset();
            loadResources();
        } catch (e) {
            toast.error('Error al guardar recurso');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar recurso?')) return;
        try {
            await deleteResource(id);
            toast.success('Recurso eliminado');
            loadResources();
        } catch (e) {
            toast.error('Error al eliminar');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'drive': return <HardDrive className="h-5 w-5 text-blue-500" />;
            case 'figma': return <Figma className="h-5 w-5 text-purple-500" />;
            case 'file': return <File className="h-5 w-5 text-orange-500" />;
            default: return <LinkIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Recursos del Proyecto</h3>
                <Button onClick={() => setIsDialogOpen(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Recurso
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map(res => (
                    <Card key={res.id} className="group hover:border-brand-blue/50 transition-colors">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-md group-hover:bg-brand-blue/10 transition-colors">
                                    {getIcon(res.type)}
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-medium leading-none">{res.name}</CardTitle>
                                    <CardDescription className="text-xs truncate max-w-[150px]">{res.url}</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(res.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <a href={res.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="w-full mt-2">
                                    <ExternalLink className="mr-2 h-3 w-3" /> Abrir Recurso
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Recurso</DialogTitle>
                        <DialogDescription className="sr-only">
                            Formulario para añadir un nuevo recurso al proyecto
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input {...register('name', { required: true })} placeholder="Ej. Carpeta de Drive" />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select onValueChange={(v) => setValue('type', v as any)} defaultValue="link">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="link">Enlace Web</SelectItem>
                                    <SelectItem value="drive">Google Drive</SelectItem>
                                    <SelectItem value="figma">Figma</SelectItem>
                                    <SelectItem value="file">Archivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input {...register('url', { required: true })} placeholder="https://..." />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
