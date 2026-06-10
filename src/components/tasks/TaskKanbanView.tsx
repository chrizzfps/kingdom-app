import {
    MoreHorizontal,
    Edit,
    Trash2,
    Calendar,
    Briefcase,
    Link2,
    Building2
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import type { AllTask } from "@/hooks/useAllTasks";
import { getPriorityLabel, columns } from "@/components/tasks/task-utils";
import { useUsers } from "@/hooks/useUsers";

import type { Client, Project } from "@/types/crm";

interface TaskKanbanViewProps {
    tasks: AllTask[];
    onUpdateStatus: (id: string, status: string) => void;
    onEdit: (task: AllTask) => void;
    onDelete: (id: string) => void;
    clients?: Client[];
    projects?: Project[];
}

export function TaskKanbanView({ tasks, onUpdateStatus, onEdit, onDelete, clients: _clients, projects: _projects }: TaskKanbanViewProps) {
    const { users } = useUsers();

    const getFirstName = (name?: string) => {
        if (!name) return "";
        return name.split(' ')[0];
    };

    const onDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            onUpdateStatus(taskId, status);
        }
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter((t) => t.status === status);
    };

    const getDeadlineColor = (deadline?: string | Date) => {
        if (!deadline) return "text-muted-foreground/30";
        const today = new Date();
        const d = new Date(deadline);
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);

        const diffTime = d.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "text-destructive font-semibold";
        if (diffDays <= 3) return "text-orange-500 font-semibold";
        return "text-muted-foreground";
    };

    return (
        <div className="h-full min-h-[60vh] flex gap-4 md:gap-6 overflow-x-auto pb-8 custom-scrollbar scroll-smooth bg-transparent">
            {columns.map((col, colIdx) => {
                const columnTasks = getTasksByStatus(col.id);
                const Icon = col.icon;

                return (
                    <div
                        key={col.id}
                        style={{ animationDelay: `${colIdx * 50}ms` }}
                        className="flex-1 min-w-[320px] max-w-[360px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-2"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, col.id)}
                    >
                        {/* Column Header */}
                        <div className="px-2 py-4 flex justify-between items-center shrink-0 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center transition-all">
                                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-none mb-1">Sector {colIdx + 1}</span>
                                    <h3 className="font-bold text-lg tracking-tight text-foreground leading-none">{col.title}</h3>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-muted/50 border-transparent text-muted-foreground text-[10px] h-5 px-2 rounded-md font-bold">
                                {columnTasks.length}
                            </Badge>
                        </div>

                        {/* Card Stream */}
                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar p-1 pb-10">
                            {columnTasks.map((task, taskIdx) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, task.id)}
                                    style={{ animationDelay: `${taskIdx * 30}ms` }}
                                    className="bg-card p-5 rounded-2xl border border-border/50 hover:border-primary/30 shadow-sm transition-all duration-300 cursor-grab active:cursor-grabbing group relative animate-in fade-in"
                                >
                                    {/* Priority Badge */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold tracking-tight uppercase border transition-all",
                                            task.priority === 'urgent' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                task.priority === 'high' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                                    task.priority === 'medium' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                        "bg-muted text-muted-foreground border-transparent"
                                        )}>
                                            {getPriorityLabel(task.priority)}
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-muted/30 opacity-0 group-hover:opacity-100 transition-opacity border border-border/50">
                                                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl border-border bg-popover p-1 shadow-xl">
                                                <DropdownMenuItem onClick={() => onEdit(task)} className="gap-2 rounded-lg py-1.5 cursor-pointer">
                                                    <Edit className="w-3.5 h-3.5" /> <span className="text-xs font-semibold">Editar</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-muted/50" />
                                                {columns.filter(c => c.id !== task.status).map(c => (
                                                    <DropdownMenuItem key={c.id} onClick={() => onUpdateStatus(task.id, c.id)} className="gap-2 rounded-lg py-1.5 cursor-pointer">
                                                        <c.icon className="w-3.5 h-3.5 opacity-50" /> <span className="text-xs font-medium">Mover a {c.title}</span>
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuSeparator className="bg-muted/50" />
                                                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive gap-2 rounded-lg py-1.5 cursor-pointer">
                                                    <Trash2 className="w-3.5 h-3.5" /> <span className="text-xs font-semibold">Eliminar</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Task Title */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <h4 className="text-sm font-semibold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors cursor-pointer" onClick={() => onEdit(task)}>
                                            {task.title}
                                        </h4>
                                        {task.resources && task.resources.length > 0 && (
                                            <div className="flex items-center gap-1 bg-primary/5 text-primary text-[9px] px-1.5 py-0.5 rounded shrink-0 border border-primary/10">
                                                <Link2 className="h-2.5 w-2.5" />
                                                <span className="font-bold">{task.resources.length}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Metadata */}
                                    <div className="space-y-1.5 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-muted-foreground/40" />
                                            <span className="text-[11px] font-medium text-muted-foreground truncate">{task.clientName || "—"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground/40" />
                                            <span className="text-[11px] font-semibold text-foreground/70 truncate">{task.projectName}</span>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="flex items-center justify-between border-t border-border/30 pt-3">
                                        {task.dueDate && (
                                            <div className={cn("flex items-center gap-1.5 text-[10px] font-bold tracking-tight", getDeadlineColor(task.dueDate))}>
                                                <Calendar className="w-3 h-3 opacity-60" />
                                                <span>{formatDate(task.dueDate)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {task.assigneeId && (
                                                (() => {
                                                    const assignee = users.find(u => u.id === task.assigneeId);
                                                    if (!assignee) return null;
                                                    return (
                                                        <div className="flex items-center gap-1.5 bg-muted/30 px-1.5 py-0.5 rounded-full border border-border/50">
                                                            <Avatar className="h-4 w-4">
                                                                <AvatarImage src={assignee.avatar_url} />
                                                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold uppercase">
                                                                    {(assignee.displayName || assignee.name || "U").substring(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                                {getFirstName(assignee.displayName || assignee.name)}
                                                            </span>
                                                        </div>
                                                    );
                                                })()
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

