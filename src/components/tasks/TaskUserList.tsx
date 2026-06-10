import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Calendar, Briefcase, Link2, Users, Circle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AllTask } from "@/hooks/useAllTasks";
import type { User } from "@/hooks/useUsers";
import { getPriorityLabel, getStatusIcon } from "./task-utils";

interface TaskUserListProps {
    tasks: AllTask[];
    users: User[];
    onUpdate: (id: string, data: any) => void;
    onEdit: (task: AllTask) => void;
    onDelete: (task: string) => void;
}

export function TaskUserList({ tasks, users, onEdit, onDelete }: TaskUserListProps) {

    // Helper to get user's actual display name
    const getUserDisplayName = (user: User) => user.displayName || user.name || user.email || 'Usuario';
    const getUserInitials = (user: User) => {
        const name = getUserDisplayName(user);
        return name.substring(0, 2).toUpperCase();
    };

    const getTasksByUser = (userId: string) => {
        return tasks.filter((t) => t.assigneeId === userId);
    };

    const getUnassignedTasks = () => {
        return tasks.filter((t) => !t.assigneeId);
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

    // Render a single task row - Now responsive
    const renderTaskRow = (task: AllTask) => (
        <div
            key={task.id}
            className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-3 rounded-lg border border-border/40 bg-card hover:bg-muted/30 hover:border-primary/20 transition-all mb-2"
        >
            {/* Mobile: Top row with status and title */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Status Icon */}
                <div className="shrink-0 text-muted-foreground mt-0.5">
                    {getStatusIcon(task.status)}
                </div>

                {/* Title & Project */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors" onClick={() => onEdit(task)}>
                            {task.title}
                        </span>
                        {task.resources && task.resources.length > 0 && (
                            <div className="flex items-center gap-1 bg-primary/5 text-primary text-[9px] px-1.5 py-0.5 rounded shrink-0 border border-primary/10">
                                <Link2 className="h-2.5 w-2.5" />
                                <span className="font-bold">{task.resources.length}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="font-medium text-foreground/70 truncate flex items-center gap-1">
                            <Briefcase className="w-3 h-3 opacity-50" />
                            {task.projectName || "Sin Proyecto"}
                        </span>
                        {task.clientName && (
                            <>
                                <span className="opacity-30 hidden sm:inline">•</span>
                                <span className="truncate opacity-70 hidden sm:inline">{task.clientName}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile: Bottom row with priority, date, actions */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 pl-7 sm:pl-0">
                {/* Priority */}
                <div className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border w-max tracking-tight",
                    task.priority === 'urgent' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        task.priority === 'high' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                            task.priority === 'medium' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                "bg-muted text-muted-foreground border-transparent"
                )}>
                    {getPriorityLabel(task.priority)}
                </div>

                {/* Due Date */}
                <div className="text-xs shrink-0">
                    {task.dueDate ? (
                        <div className={cn("flex items-center gap-1 font-medium", getDeadlineColor(task.dueDate))}>
                            <Calendar className="w-3 h-3 opacity-70" />
                            <span className="hidden sm:inline">{formatDate(task.dueDate)}</span>
                            <span className="sm:hidden">{new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground/30 hidden sm:inline">-</span>
                    )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70 hover:text-foreground" onClick={() => onEdit(task)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70 hover:text-destructive" onClick={() => onDelete(task.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pb-10 space-y-8 pr-2">

            {/* Unassigned Section */}
            {getUnassignedTasks().length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-3 mb-4 sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b border-border/50">
                        <div className="p-1.5 rounded-lg bg-muted/40 border border-border/50">
                            <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-lg tracking-tight">Sin Asignar</h3>
                        <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold text-[10px]">{getUnassignedTasks().length}</Badge>
                    </div>
                    <div className="pl-4 border-l-2 border-border/30 space-y-1">
                        {getUnassignedTasks().map(task => renderTaskRow(task))}
                    </div>
                </div>
            )}

            {/* User Sections */}
            {users.map((user, idx) => {
                const userTasks = getTasksByUser(user.id);
                if (userTasks.length === 0) return null;

                return (
                    <div key={user.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex items-center gap-3 mb-4 sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b border-border/50">
                            <Avatar className="h-8 w-8 border border-border shadow-sm">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                    {getUserInitials(user)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-base sm:text-lg tracking-tight leading-none">{getUserDisplayName(user)}</h3>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{user.role || 'Miembro'}</span>
                            </div>
                            <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold text-[10px] ml-auto">{userTasks.length} Tareas</Badge>
                        </div>
                        <div className="pl-4 border-l-2 border-border/30 space-y-1">
                            {userTasks.map(task => renderTaskRow(task))}
                        </div>
                    </div>
                );
            })}
            {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Circle className="w-12 h-12 mb-4 opacity-20" />
                    <p>No hay tareas para mostrar</p>
                </div>
            )}
        </div>
    );
}
