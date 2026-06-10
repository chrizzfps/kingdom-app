import { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, closestCorners } from '@dnd-kit/core';
import type { Task, TaskStatus } from '@/types/crm';
import { updateTask } from '@/api/crm';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TaskBoardProps {
    tasks: Task[];
    onRefresh: () => void;
    onEdit: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'Por Hacer' },
    { id: 'in_progress', title: 'En Progreso' },
    { id: 'review', title: 'Revisión' },
    { id: 'done', title: 'Completado' }
];

export function TaskBoard({ tasks, onRefresh, onEdit }: TaskBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const taskId = active.id;
        const newStatus = over.id as TaskStatus;

        // Optimistic update locally? 
        // For simplicity, we just call API and refresh
        if (tasks.find(t => t.id === taskId)?.status !== newStatus) {
            try {
                await updateTask(taskId, { status: newStatus });
                onRefresh();
            } catch (e) {
                toast.error('Error al mover tarea');
            }
        }
    };

    return (
        <DndContext collisionDetection={closestCorners} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px]">
                {COLUMNS.map(col => (
                    <DroppableColumn key={col.id} id={col.id} title={col.title} tasks={tasks.filter(t => t.status === col.id)} onEdit={onEdit} />
                ))}
            </div>
            <DragOverlay>
                {activeId ? <TaskCard task={tasks.find(t => t.id === activeId)!} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}

function DroppableColumn({ id, title, tasks, onEdit }: { id: string, title: string, tasks: Task[], onEdit: any }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="bg-muted/30 rounded-lg p-4 flex flex-col gap-3 h-full border border-border/50">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{title}</h3>
                <Badge variant="outline" className="text-xs">{tasks.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
                {tasks.map(task => (
                    <DraggableTask key={task.id} task={task} onEdit={onEdit} />
                ))}
            </div>
        </div>
    );
}

function DraggableTask({ task, onEdit }: { task: Task, onEdit: any }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <TaskCard task={task} onClick={() => onEdit(task)} />
        </div>
    );
}

function TaskCard({ task, isOverlay, onClick }: { task: Task, isOverlay?: boolean, onClick?: () => void }) {
    return (
        <Card onClick={onClick} className={`cursor-pointer hover:border-brand-blue/50 transition-colors ${isOverlay ? 'shadow-2xl scale-105 rotate-2' : 'shadow-sm'}`}>
            <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-medium leading-tight">{task.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] px-1 py-0 h-4 ${task.priority === 'urgent' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                        {task.priority}
                    </Badge>
                    {task.dueDate && (
                        <span className="text-[10px] text-muted-foreground">
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
