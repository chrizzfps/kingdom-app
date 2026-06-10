import type { Task } from '@/types/crm';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { CheckCircle2, Circle } from 'lucide-react';

interface TaskListProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
    return (
        <div className="rounded-md border border-border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30px]"></TableHead>
                        <TableHead>Tarea</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead className="text-right">Asignado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onTaskClick(task)}>
                            <TableCell>
                                {task.status === 'done' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                            </TableCell>
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell>
                                <span className="text-xs text-muted-foreground uppercase font-medium">{task.status.replace('_', ' ')}</span>
                            </TableCell>
                            <TableCell>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                                        task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                            'text-muted-foreground'
                                    }`}>
                                    {task.priority}
                                </span>
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                                {task.assigneeId || '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                    {tasks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No hay tareas en esta lista.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
