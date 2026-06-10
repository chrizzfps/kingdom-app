import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjectSchema, type ProjectFormData } from '@/types/projectSchema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Project, Client } from '@/types/crm';
import { createProject, updateProject } from '@/api/crm';
import { toast } from 'sonner';

interface ProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Project | null;
    clients: Client[];
    onSuccess: () => void;
}

export function ProjectDialog({ open, onOpenChange, project, clients, onSuccess }: ProjectDialogProps) {
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectFormData>({
        resolver: zodResolver(ProjectSchema),
        defaultValues: {
            status: 'lead',
            currency: 'EUR'
        }
    });

    useEffect(() => {
        if (project) {
            reset({
                name: project.name,
                clientId: project.clientId,
                description: project.description || '',
                status: (project.status as any) || 'lead',
                currency: project.currency || 'EUR',
                deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''
            });
        } else {
            reset({
                name: '',
                clientId: '',
                description: '',
                status: 'lead',
                currency: 'EUR',
                deadline: ''
            });
        }
    }, [project, reset, open]);

    const onSubmit = async (data: ProjectFormData) => {
        setLoading(true);
        try {
            // Convert string date back to Date object if needed, or handle in API
            const payload: any = {
                ...data,
                deadline: data.deadline ? new Date(data.deadline) : undefined
            };

            if (project) {
                await updateProject(project.id, payload);
                toast.success('Proyecto actualizado');
            } else {
                await createProject(payload);
                toast.success('Proyecto creado');
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar proyecto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{project ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
                    <DialogDescription>
                        Define los detalles del proyecto y su estado actual.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Proyecto *</Label>
                        <Input id="name" {...register('name')} placeholder="Ej. Rediseño Web 2024" className={errors.name ? "border-destructive" : ""} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="clientId">Cliente *</Label>
                        <Select onValueChange={(val) => setValue('clientId', val)} value={project?.clientId}>
                            <SelectTrigger className={errors.clientId ? "border-destructive" : ""}>
                                <SelectValue placeholder="Seleccionar cliente..." />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                                {clients && clients.length > 0 ? (
                                    clients.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-muted-foreground">No hay clientes disponibles.</div>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select onValueChange={(val) => setValue('status', val as any)} defaultValue={project?.status || 'lead'}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                                <SelectItem value="lead">Prospecto (Lead)</SelectItem>
                                <SelectItem value="active">Activo (En curso)</SelectItem>
                                <SelectItem value="completed">Completado</SelectItem>
                                <SelectItem value="archived">Archivado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Fecha Límite</Label>
                            <Input id="deadline" type="date" {...register('deadline')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">Moneda</Label>
                            <Select onValueChange={(val) => setValue('currency', val)} defaultValue={project?.currency || 'EUR'}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="MXN">MXN ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" {...register('description')} placeholder="Detalles clave del proyecto..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            variant="contrast"
                            className="w-full md:w-auto font-bold !bg-[#000000] !text-[#ffffff] dark:!bg-[#ffffff] dark:!text-[#000000]"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {project ? 'Guardar Cambios' : 'Crear Proyecto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
