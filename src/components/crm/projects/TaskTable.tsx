import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import type { Task } from "@/types/crm";
import { deleteTask } from "@/api/crm";
import { toast } from "sonner";
import { Paperclip, Rocket, Calendar } from "lucide-react";

interface TaskTableProps {
    tasks: Task[];
    onEdit: (task: Task) => void;
    onRefresh: () => void;
}

export function TaskTable({ tasks, onEdit, onRefresh }: TaskTableProps) {
    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar tarea?')) return;
        try {
            await deleteTask(id);
            toast.success('Tarea eliminada');
            onRefresh();
        } catch (e) {
            toast.error('Error al eliminar');
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'urgent': return 'bg-red-500 text-white hover:bg-red-600';
            case 'high': return 'bg-orange-500 text-white hover:bg-orange-600';
            case 'medium': return 'bg-blue-500 text-white hover:bg-blue-600';
            default: return 'bg-gray-500 text-white hover:bg-gray-600';
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tarea</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Lanzamiento</TableHead>
                        <TableHead>Recursos</TableHead>
                        <TableHead>Creada</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                No hay tareas registradas.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">
                                    {task.title}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{task.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                </TableCell>
                                <TableCell>
                                    {task.isLaunchEvent ? (
                                        <Badge variant="outline" className="border-purple-500 text-purple-500 gap-1">
                                            <Rocket className="h-3 w-3" /> SI
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs text-center block">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {task.resources && task.resources.length > 0 ? (
                                        <Badge variant="secondary" className="gap-1">
                                            <Paperclip className="h-3 w-3" /> {task.resources.length}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs text-center block">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEdit(task)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => handleDelete(task.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
