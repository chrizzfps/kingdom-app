import type { Task, TaskStatus } from '@/types/crm';
import { updateTask } from '@/api/crm';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface TaskBoardProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onTaskUpdate: () => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'Por hacer', color: 'bg-zinc-500/20 text-zinc-500' },
    { id: 'in_progress', title: 'En progreso', color: 'bg-blue-500/20 text-blue-500' },
    { id: 'review', title: 'Revisión', color: 'bg-orange-500/20 text-orange-500' },
    { id: 'done', title: 'Completada', color: 'bg-green-500/20 text-green-500' },
];

export function TaskBoard({ tasks, onTaskClick, onTaskUpdate }: TaskBoardProps) {
    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const taskId = active.id;
        const newStatus = over.id as TaskStatus;

        if (tasks.find(t => t.id === taskId)?.status !== newStatus) {
            await updateTask(taskId, { status: newStatus });
            onTaskUpdate();
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map(col => (
                    <div key={col.id} className="w-[300px] shrink-0 flex flex-col bg-muted/20 rounded-xl border border-border/50 h-full max-h-[calc(100vh-220px)]">
                        <div className="p-3 font-semibold text-sm flex items-center justify-between border-b border-border/50">
                            <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${col.color.replace('text-', 'bg-').split(' ')[0]}`}></span>
                                {col.title}
                            </span>
                            <span className="text-muted-foreground text-xs bg-muted px-1.5 py-0.5 rounded">
                                {tasks.filter(t => t.status === col.id).length}
                            </span>
                        </div>
                        <DroppableColumn id={col.id} className="p-2 flex-1 overflow-y-auto space-y-2 scrollbar-none">
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <DraggableTask key={task.id} task={task} onClick={() => onTaskClick(task)} />
                            ))}
                        </DroppableColumn>
                    </div>
                ))}
            </div>
        </DndContext>
    );
}

function DroppableColumn({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={className}>
            {children}
        </div>
    );
}

function DraggableTask({ task, onClick }: { task: Task; onClick: () => void }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    });
    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
            <div
                className="bg-card p-3 rounded-lg border border-border shadow-sm hover:border-brand-blue/50 cursor-pointer group space-y-2 select-none"
                onClick={onClick}
            >
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{task.title}</p>
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className={`px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                        task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                            'bg-zinc-500/10 text-zinc-500'
                        }`}>{task.priority}</span>
                    {task.assigneeId && (
                        <div className="w-5 h-5 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold">
                            U
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
