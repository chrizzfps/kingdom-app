import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AllTask } from "@/hooks/useAllTasks";
import type { User } from "@/hooks/useUsers";
import { getPriorityLabel, getStatusIcon, columns } from "@/components/tasks/task-utils";

import type { Client, Project } from "@/types/crm";
import { Link2, Circle, ChevronDown, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Calendar, Briefcase } from "lucide-react";

interface TaskPlanningViewProps {
    tasks: AllTask[];
    users: User[];
    clients: Client[];
    projects: Project[];
    columnWidths: any;
    createResizeHandler: (col: string) => (e: React.MouseEvent) => void;
    onUpdate: (id: string, field: string, value: any) => void;
    onDelete: (id: string) => void;
    onEdit: (task: AllTask) => void;
    onCreate: (data: any) => Promise<any>;
}

type SortKey = 'status' | 'client' | 'project' | 'name' | 'assignee' | 'priority' | 'deadline';
type SortDirection = 'asc' | 'desc';

export function TaskPlanningView({
    tasks,
    users,
    clients,
    projects,
    columnWidths,
    createResizeHandler,
    onUpdate,
    onDelete,
    onEdit,
    onCreate
}: TaskPlanningViewProps) {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);

    const handleSort = (key: SortKey) => {
        setSortConfig(current => {
            if (current?.key === key) {
                if (current.direction === 'asc') return { key, direction: 'desc' };
                return null;
            }
            return { key, direction: 'asc' };
        });
    };

    const sortedTasks = useMemo(() => {
        if (!sortConfig) return tasks;

        return [...tasks].sort((a, b) => {
            let aValue: any = '';
            let bValue: any = '';

            switch (sortConfig.key) {
                case 'status':
                    aValue = columns.findIndex(c => c.id === a.status);
                    bValue = columns.findIndex(c => c.id === b.status);
                    break;
                case 'client':
                    aValue = a.clientName || '';
                    bValue = b.clientName || '';
                    break;
                case 'project':
                    aValue = a.projectName || '';
                    bValue = b.projectName || '';
                    break;
                case 'name':
                    aValue = a.title || '';
                    bValue = b.title || '';
                    break;
                case 'assignee':
                    // Sort by assignee ID or Name if possible, here ID for simplicity or resolved name
                    // Since tasks only have ID, we might want to resolve name, but for speed ID is fallback.
                    // Ideally resolve name from users prop.
                    const uA = users.find(u => u.id === a.assigneeId)?.name || '';
                    const uB = users.find(u => u.id === b.assigneeId)?.name || '';
                    aValue = uA;
                    bValue = uB;
                    break;
                case 'priority':
                    const pMap: Record<string, number> = { urgent: 3, high: 2, medium: 1, low: 0 };
                    aValue = pMap[a.priority] || 0;
                    bValue = pMap[b.priority] || 0;
                    break;
                case 'deadline':
                    aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    break;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [tasks, sortConfig, users]);

    const getUserName = (user?: User) => {
        if (!user) return "";
        return user.displayName || user.name || "Usuario";
    };

    const getFirstName = (name?: string) => {
        if (!name) return "";
        return name.split(' ')[0];
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const title = formData.get('title') as string;
        if (!title.trim()) return;

        try {
            await onCreate({
                title,
                status: 'pending',
                priority: 'medium',
                projectId: '',
                assigneeId: '',
            });
            form.reset();
        } catch (error) {
            console.error("Failed to create task", error);
        }
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

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortConfig?.key !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-20 group-hover:opacity-50 transition-opacity" />;
        if (sortConfig.direction === 'asc') return <ArrowUp className="w-3 h-3 ml-1 text-primary" />;
        return <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Desktop Table Header - Hidden on Mobile */}
            <div className="hidden md:flex items-center border-b border-border/50 bg-muted/30 text-xs font-semibold text-muted-foreground select-none shrink-0 h-10 relative z-20">
                <div
                    className="px-4 h-full flex items-center shrink-0 border-r border-border/50 relative group cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ width: columnWidths.status }}
                    onClick={() => handleSort('status')}
                >
                    Estado
                    <SortIcon column="status" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors" onMouseDown={createResizeHandler('status')} onClick={e => e.stopPropagation()} />
                </div>
                {columnWidths.client > 0 && (
                    <div
                        className="px-4 h-full flex items-center shrink-0 border-r border-border/50 relative group cursor-pointer hover:bg-muted/50 transition-colors"
                        style={{ width: columnWidths.client }}
                        onClick={() => handleSort('client')}
                    >
                        Cliente
                        <SortIcon column="client" />
                        <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors" onMouseDown={createResizeHandler('client')} onClick={e => e.stopPropagation()} />
                    </div>
                )}
                {columnWidths.project > 0 && (
                    <div
                        className="px-4 h-full flex items-center shrink-0 border-r border-border/50 relative group cursor-pointer hover:bg-muted/50 transition-colors"
                        style={{ width: columnWidths.project }}
                        onClick={() => handleSort('project')}
                    >
                        Proyecto
                        <SortIcon column="project" />
                        <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors" onMouseDown={createResizeHandler('project')} onClick={e => e.stopPropagation()} />
                    </div>
                )}
                <div
                    className="px-4 h-full flex items-center shrink-0 border-r border-border/50 relative group cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ width: columnWidths.name }}
                    onClick={() => handleSort('name')}
                >
                    Tarea
                    <SortIcon column="name" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors" onMouseDown={createResizeHandler('name')} onClick={e => e.stopPropagation()} />
                </div>
                <div
                    className="px-4 h-full flex items-center shrink-0 border-r border-border/50 relative group cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ width: columnWidths.assignee }}
                    onClick={() => handleSort('assignee')}
                >
                    Asignado
                    <SortIcon column="assignee" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors" onMouseDown={createResizeHandler('assignee')} onClick={e => e.stopPropagation()} />
                </div>
                <div
                    className="px-4 h-full flex items-center shrink-0 border-r border-border/50 relative group cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ width: columnWidths.priority }}
                    onClick={() => handleSort('priority')}
                >
                    Prioridad
                    <SortIcon column="priority" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors" onMouseDown={createResizeHandler('priority')} onClick={e => e.stopPropagation()} />
                </div>
                <div
                    className="px-4 h-full flex items-center shrink-0 relative group cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ width: columnWidths.deadline }}
                    onClick={() => handleSort('deadline')}
                >
                    Límite
                    <SortIcon column="deadline" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors" onMouseDown={createResizeHandler('deadline')} onClick={e => e.stopPropagation()} />
                </div>
                <div className="w-[80px] shrink-0 text-right pr-4">Acciones</div>
            </div>

            {/* Quick Add Row */}
            <div className="px-2 md:px-2 py-2 border-b border-dashed border-border/50 bg-muted/10 relative z-10">
                <form onSubmit={handleCreateTask} className="flex items-center gap-2 md:gap-4 px-2">
                    <div className="w-8 md:w-10 shrink-0 flex justify-center">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">+</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <Input
                            name="title"
                            placeholder="Nueva tarea..."
                            className="h-8 bg-transparent border-none text-sm font-medium focus-visible:ring-0 placeholder:text-muted-foreground/50"
                        />
                    </div>
                </form>
            </div>

            {/* List Stream */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 py-1">
                {sortedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 md:py-32 text-center px-4">
                        <Circle className="w-10 md:w-12 h-10 md:h-12 text-muted/30 mb-4" />
                        <h3 className="text-base md:text-lg font-semibold text-muted-foreground">No hay tareas</h3>
                        <p className="text-xs text-muted-foreground/60 mt-1">Tu flujo de trabajo está al día.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table Rows - Hidden on Mobile */}
                        <div className="hidden md:block">
                            {sortedTasks.map((task, idx) => (
                                <div
                                    key={task.id}
                                    style={{ animationDelay: `${idx * 20}ms` }}
                                    className="flex items-center group/row h-12 border-b border-border/30 hover:bg-muted/20 transition-colors animate-in fade-in duration-300"
                                >
                                    {/* Status Segment */}
                                    <div className="px-4 h-full flex items-center shrink-0" style={{ width: columnWidths.status }}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="focus:outline-none flex items-center justify-center">
                                                <div className="p-1.5 rounded-md bg-muted/40 border border-border/50 text-muted-foreground group-hover/row:text-primary transition-colors">
                                                    {getStatusIcon(task.status)}
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-48 rounded-xl border-border bg-popover p-1 shadow-xl">
                                                {columns.map((col: any) => (
                                                    <DropdownMenuItem
                                                        key={col.id}
                                                        onClick={() => onUpdate(task.id, 'status', col.id)}
                                                        className="gap-2 rounded-lg py-1.5 cursor-pointer focus:bg-muted"
                                                    >
                                                        <div className="opacity-70 scale-75">{getStatusIcon(col.id)}</div>
                                                        <span className="text-xs font-medium">{col.title}</span>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Client Segment */}
                                    {columnWidths.client > 0 && (
                                        <div className="px-4 h-full flex items-center shrink-0" style={{ width: columnWidths.client }}>
                                            <Select
                                                value={task.clientId || 'unassigned'}
                                                onValueChange={(val) => onUpdate(task.id, 'clientId', val === 'unassigned' ? null : val)}
                                            >
                                                <SelectTrigger className="h-6 w-full bg-transparent border-none p-0 text-xs font-semibold text-foreground/80 justify-start shadow-none focus:ring-0 hover:text-primary transition-colors cursor-pointer group">
                                                    <span className="truncate group-hover:text-primary">{task.clientName || 'Sin Cliente'}</span>
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[200px]">
                                                    <SelectItem value="unassigned">Sin Cliente</SelectItem>
                                                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Project Segment */}
                                    {columnWidths.project > 0 && (
                                        <div className="px-4 h-full flex items-center shrink-0" style={{ width: columnWidths.project }}>
                                            <Select
                                                value={task.projectId || 'unassigned'}
                                                onValueChange={(val) => onUpdate(task.id, 'projectId', val === 'unassigned' ? null : val)}
                                            >
                                                <SelectTrigger className="h-6 w-full bg-transparent border-none p-0 text-xs font-semibold text-foreground/80 justify-start hover:text-primary transition-colors shadow-none focus:ring-0 cursor-pointer">
                                                    <span className="truncate">{task.projectName || 'Sin Proyecto'}</span>
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[200px]">
                                                    <SelectItem value="unassigned">Sin Proyecto</SelectItem>
                                                    {projects.filter(p => !task.clientId || p.clientId === task.clientId).map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Identity Segment */}
                                    <div className="px-4 h-full flex items-center shrink-0 relative group/title" style={{ width: columnWidths.name }}>
                                        <div className="flex items-center gap-2 overflow-hidden w-full">
                                            <button
                                                onClick={() => onEdit(task)}
                                                className="text-sm font-semibold text-foreground hover:text-primary truncate transition-colors text-left"
                                            >
                                                {task.title}
                                            </button>
                                            {task.resources && task.resources.length > 0 && (
                                                <div className="flex items-center gap-1 bg-primary/5 text-primary text-[10px] px-1.5 py-0.5 rounded shrink-0 border border-primary/10">
                                                    <Link2 className="h-2.5 w-2.5" />
                                                    <span className="font-bold">{task.resources.length}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ownership Segment */}
                                    <div className="px-4 h-full flex items-center shrink-0" style={{ width: columnWidths.assignee }}>
                                        <Select
                                            value={task.assigneeId || 'unassigned'}
                                            onValueChange={(val) => onUpdate(task.id, 'assigneeId', val === 'unassigned' ? null : val)}
                                        >
                                            <SelectTrigger className="h-6 w-full bg-transparent border-none p-0 flex items-center gap-2 shadow-none focus:ring-0 cursor-pointer text-foreground overflow-hidden">
                                                {task.assigneeId ? (
                                                    <>
                                                        <Avatar className="h-5 w-5 border border-border/50 shrink-0">
                                                            <AvatarImage src={users.find(u => u.id === task.assigneeId)?.avatar_url} />
                                                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                                                {(getUserName(users.find(u => u.id === task.assigneeId))).substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs font-semibold text-foreground uppercase tracking-tight truncate">
                                                            {getFirstName(getUserName(users.find(u => u.id === task.assigneeId)))}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest pl-1">Asignar</span>
                                                )}
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px] bg-popover text-popover-foreground border-border shadow-xl">
                                                <SelectItem value="unassigned" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SIN ASIGNAR</SelectItem>
                                                {users.map(u => (
                                                    <SelectItem key={u.id} value={u.id} className="cursor-pointer">
                                                        <div className="flex items-center gap-3 py-1">
                                                            <Avatar className="h-6 w-6 border border-border/50 shrink-0">
                                                                <AvatarImage src={u.avatar_url} />
                                                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                                                    {(u.displayName || u.name || "U").substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <span className="text-sm font-bold text-foreground truncate">{u.displayName || u.name}</span>
                                                                <span className="text-[10px] text-muted-foreground leading-none lowercase opacity-60 truncate">@{u.id.substring(0, 6)}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Priority Segment */}
                                    <div className="px-4 h-full flex items-center shrink-0" style={{ width: columnWidths.priority }}>
                                        <Select
                                            value={task.priority}
                                            onValueChange={(val) => onUpdate(task.id, 'priority', val)}
                                        >
                                            <SelectTrigger className="h-8 w-full border-none bg-transparent p-0 focus:ring-0 shadow-none">
                                                <div className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold tracking-tight uppercase border transition-all flex items-center gap-1",
                                                    task.priority === 'urgent' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                        task.priority === 'high' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                                            task.priority === 'medium' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                                "bg-muted text-muted-foreground border-transparent"
                                                )}>
                                                    {getPriorityLabel(task.priority)}
                                                    <ChevronDown className="w-2 h-2 opacity-50" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border bg-popover p-1 shadow-xl">
                                                <SelectItem value="low" className="text-xs font-medium">Baja</SelectItem>
                                                <SelectItem value="medium" className="text-xs font-medium text-blue-500">Media</SelectItem>
                                                <SelectItem value="high" className="text-xs font-medium text-orange-500">Alta</SelectItem>
                                                <SelectItem value="urgent" className="text-xs font-medium text-red-500">Urgente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Timeline Segment */}
                                    <div className="px-4 h-full flex items-center shrink-0" style={{ width: columnWidths.deadline }}>
                                        <Input
                                            type="date"
                                            defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                            onBlur={(e) => {
                                                const newVal = e.target.value ? new Date(e.target.value) : null;
                                                onUpdate(task.id, 'dueDate', newVal);
                                            }}
                                            className={cn("h-8 border-none bg-transparent p-0 text-xs font-medium focus-visible:ring-0 shadow-none transition-all cursor-pointer", getDeadlineColor(task.dueDate))}
                                        />
                                    </div>

                                    {/* Action Segment */}
                                    <div className="px-4 h-full flex items-center justify-end gap-1 shrink-0" style={{ width: columnWidths.actions || 80 }}>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-muted text-foreground/70 hover:text-foreground transition-all" onClick={() => onEdit(task)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md hover:bg-destructive/10 hover:text-destructive text-foreground/70 transition-all" onClick={() => onDelete(task.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Card Layout - Shown only on Mobile */}
                        <div className="md:hidden space-y-2 px-2">
                            {sortedTasks.map((task, idx) => {
                                const assignee = users.find(u => u.id === task.assigneeId);
                                return (
                                    <div
                                        key={task.id}
                                        style={{ animationDelay: `${idx * 30}ms` }}
                                        className="p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/20 transition-all animate-in fade-in duration-300"
                                    >
                                        {/* Top Row: Status + Title + Actions */}
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 rounded-md bg-muted/40 border border-border/50 text-muted-foreground shrink-0 mt-0.5">
                                                {getStatusIcon(task.status)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <button
                                                    onClick={() => onEdit(task)}
                                                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left line-clamp-2"
                                                >
                                                    {task.title}
                                                </button>
                                                {/* Project & Client */}
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <Briefcase className="w-3 h-3 opacity-50" />
                                                    <span className="truncate">{task.projectName || task.clientName || 'Sin proyecto'}</span>
                                                </div>
                                            </div>
                                            {/* Mobile Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEdit(task)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(task.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Bottom Row: Meta Info */}
                                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/30">
                                            {/* Assignee */}
                                            {assignee ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Avatar className="h-5 w-5 border border-border/50">
                                                        <AvatarImage src={assignee.avatar_url} />
                                                        <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                                                            {(getUserName(assignee)).substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs font-medium text-foreground/70">{getFirstName(getUserName(assignee))}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">Sin asignar</span>
                                            )}

                                            <div className="flex-1" />

                                            {/* Priority */}
                                            <div className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border",
                                                task.priority === 'urgent' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                    task.priority === 'high' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                                        task.priority === 'medium' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                            "bg-muted text-muted-foreground border-transparent"
                                            )}>
                                                {getPriorityLabel(task.priority)}
                                            </div>

                                            {/* Deadline */}
                                            {task.dueDate && (
                                                <div className={cn("flex items-center gap-1 text-xs", getDeadlineColor(task.dueDate))}>
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

