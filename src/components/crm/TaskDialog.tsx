import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Task, TaskPriority, TaskStatus } from '@/types/crm';
import { createTask, updateTask } from '@/api/crm';
import { toast } from 'sonner';

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null;
    projectId: string; // Required for creating new tasks
    onSuccess: () => void;
}

export function TaskDialog({ open, onOpenChange, task, projectId, onSuccess }: TaskDialogProps) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm<Partial<Task>>();

    useEffect(() => {
        if (task) {
            reset(task);
            // manually set values for selects if needed, or rely on defaultValue if strict
            // If values are not setting correctly with reset, use setValue
            setValue('status', task.status);
            setValue('priority', task.priority);
        } else {
            reset({ status: 'todo', priority: 'medium' });
        }
    }, [task, reset, open]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            if (task) {
                await updateTask(task.id, data);
                toast.success('Tarea actualizada');
            } else {
                await createTask({ ...data, projectId });
                toast.success('Tarea creada');
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar tarea');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{task ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                    <DialogDescription>
                        Define los detalles de la tarea.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" {...register('title', { required: true })} placeholder="Diseñar interfaz..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select onValueChange={(val) => setValue('status', val as TaskStatus)} defaultValue={task?.status || 'todo'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
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
                            <Select onValueChange={(val) => setValue('priority', val as TaskPriority)} defaultValue={task?.priority || 'medium'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Prioridad" />
                                </SelectTrigger>
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
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" {...register('description')} rows={3} />
                    </div>

                    {/* Future: Assignee & Date Picker */}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {task ? 'Guardar Cambios' : 'Crear Tarea'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
