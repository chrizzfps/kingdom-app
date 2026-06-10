import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTask, updateTask } from '@/api/crm';
import type { Task } from '@/types/crm';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null;
    projectId: string;
    onSuccess: () => void;
}

export function TaskDialog({ open, onOpenChange, task, projectId, onSuccess }: TaskDialogProps) {
    const { register, handleSubmit, reset, setValue } = useForm<Partial<Task>>({
        defaultValues: {
            status: 'todo',
            priority: 'medium'
        }
    });

    useEffect(() => {
        if (task) {
            reset({
                ...task,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] as any : ''
            });
        } else {
            reset({
                projectId,
                status: 'todo',
                priority: 'medium'
            });
        }
    }, [task, projectId, reset, open]);

    const onSubmit = async (data: any) => {
        try {
            const payload = {
                ...data,
                projectId,
                dueDate: data.dueDate ? new Date(data.dueDate) : null
            };

            if (task) {
                await updateTask(task.id, payload);
                toast.success('Tarea actualizada');
            } else {
                await createTask(payload);
                toast.success('Tarea creada');
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar tarea');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{task ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Título</Label>
                        <Input {...register('title', { required: true })} placeholder="Revisar diseño..." />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select onValueChange={(v) => setValue('status', v as any)} defaultValue={task?.status || 'todo'}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">Por hacer</SelectItem>
                                    <SelectItem value="in_progress">En progreso</SelectItem>
                                    <SelectItem value="review">Revisión</SelectItem>
                                    <SelectItem value="done">Completada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Prioridad</Label>
                            <Select onValueChange={(v) => setValue('priority', v as any)} defaultValue={task?.priority || 'medium'}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baja</SelectItem>
                                    <SelectItem value="medium">Media</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="urgent">Urgente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Fecha Límite</Label>
                        <Input type="date" {...register('dueDate')} />
                    </div>

                    <div className="space-y-2">
                         <div className="flex items-center space-x-2">
                            <input type="checkbox" {...register('isLaunchEvent')} id="launch" className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
                            <Label htmlFor="launch" className="cursor-pointer">Es un lanzamiento / Publicación</Label>
                         </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea {...register('description')} />
                    </div>

                    <DialogFooter>
                        <Button type="submit">{task ? 'Guardar Cambios' : 'Crear Tarea'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
