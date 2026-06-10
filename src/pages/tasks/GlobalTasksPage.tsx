import { useState, useMemo } from "react";
import { useAllTasks, type AllTask } from "@/hooks/useAllTasks";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { useColumnResize } from "@/hooks/useColumnResize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
    Building2,
    Briefcase,
    Search,
    LayoutGrid,
    ListTodo,
    Tag
} from "lucide-react";
import { cn } from "@/lib/utils";


import { TaskPlanningView } from "@/components/tasks/TaskPlanningView";
import { TaskKanbanView } from "@/components/tasks/TaskKanbanView";
import { TaskUserList } from "../../components/tasks/TaskUserList";
import { TaskEditSheet } from "@/components/tasks/TaskEditSheet";
import { columns } from "@/components/tasks/task-utils";
import { KingdomLoader } from "@/components/ui/KingdomLoader";

export default function GlobalTasksPage() {
    const { tasks, isLoading, updateTask, deleteTask, createTask } = useAllTasks();
    const { users } = useUsers();
    const { clients } = useClients();
    const { projects } = useProjects();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClient, setSelectedClient] = useState<string>("all");
    const [selectedProject, setSelectedProject] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [showCompleted, setShowCompleted] = useState(false);
    const [activeView, setActiveView] = useState<'planning' | 'kanban' | 'users'>('planning');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<AllTask | null>(null);

    const { columnWidths, createResizeHandler } = useColumnResize("global-tasks", {
        status: 120,
        client: 180,
        project: 180,
        name: 400,
        assignee: 200,
        priority: 140,
        deadline: 160
    });

    const filteredTasks = useMemo(() => {
        const filtered = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.projectName?.toLowerCase().includes(searchQuery.toLowerCase());

            const project = projects.find(p => p.id === task.projectId);
            const taskClientId = project?.clientId;

            const matchesClient = selectedClient === "all" || taskClientId === selectedClient;
            const matchesProject = selectedProject === "all" || task.projectId === selectedProject;
            const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;

            // Hide completed tasks unless showCompleted is true
            // Also ensure we don't hide tasks if the user specifically selected "completed" or "done" status
            const statusStr = task.status as string;
            const isCompleted = statusStr === 'completed' || statusStr === 'done';
            const shouldShow = showCompleted || !isCompleted || selectedStatus === 'completed';

            return matchesSearch && matchesClient && matchesProject && matchesStatus && shouldShow;
        });

        // Sort by deadline: nearest first (ascending), tasks without deadline go to the end
        return filtered.sort((a, b) => {
            // Tasks without deadline go to the end
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            // Convert to Date objects for comparison
            const dateA = (a.dueDate as any)?.seconds ? new Date((a.dueDate as any).seconds * 1000) : new Date(a.dueDate);
            const dateB = (b.dueDate as any)?.seconds ? new Date((b.dueDate as any).seconds * 1000) : new Date(b.dueDate);

            // Ascending order (nearest deadline first)
            return dateA.getTime() - dateB.getTime();
        });
    }, [tasks, searchQuery, selectedClient, selectedProject, selectedStatus, projects, showCompleted]);

    if (isLoading) {
        return <KingdomLoader />;
    }

    return (
        <div className="h-full text-foreground animate-in fade-in duration-500 flex flex-col">
            {/* Minimalist Header */}
            <header className="px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-border/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <ListTodo className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Entorno de Trabajo</span>
                    </div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">Tareas Globales</h1>
                    <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Supervisión y flujo de trabajo centralizado de Kingdom Agency.</p>
                </div>
            </header>

            {/* Platform Integrated Toolbar */}
            <div className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 md:px-6 lg:px-8 py-3 md:py-4">
                <div className="flex flex-col gap-3">
                    {/* Search Row */}
                    <div className="relative group w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar tareas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 bg-muted/30 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 transition-all text-sm"
                        />
                    </div>

                    {/* Filters + View Switcher Row */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
                        {/* Filters - Compact on mobile */}
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                            <SelectTrigger className="h-9 px-2 md:px-3 bg-muted/30 border-none rounded-lg text-xs font-medium w-auto min-w-[100px] md:min-w-[140px] shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="Cliente" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-popover">
                                <SelectItem value="all">Todos</SelectItem>
                                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger className="h-9 px-2 md:px-3 bg-muted/30 border-none rounded-lg text-xs font-medium w-auto min-w-[100px] md:min-w-[140px] shrink-0 hidden sm:flex">
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="Proyecto" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-popover">
                                <SelectItem value="all">Todos</SelectItem>
                                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="h-9 px-2 md:px-3 bg-muted/30 border-none rounded-lg text-xs font-medium w-auto min-w-[90px] md:min-w-[120px] shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="Estado" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-popover">
                                <SelectItem value="all">Todos</SelectItem>
                                {columns.map(col => <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <div
                            className={cn(
                                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer select-none",
                                showCompleted
                                    ? "bg-primary/10"
                                    : "hover:bg-muted/50"
                            )}
                            onClick={() => setShowCompleted(!showCompleted)}
                        >
                            <Switch
                                id="show-completed"
                                checked={showCompleted}
                                onCheckedChange={setShowCompleted}
                                className="scale-75 data-[state=checked]:bg-zinc-200 dark:data-[state=checked]:bg-zinc-800 data-[state=checked]:[&>span]:!bg-black dark:data-[state=checked]:[&>span]:!bg-white data-[state=unchecked]:bg-zinc-600 dark:data-[state=unchecked]:bg-zinc-700 [&>span]:bg-white border-2 border-transparent transition-colors"
                            />
                            <Label
                                htmlFor="show-completed"
                                className="text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                            >
                                {showCompleted ? (
                                    <span className="text-primary font-bold">Ocultar completadas</span>
                                ) : (
                                    <span className="text-muted-foreground">Mostrar completadas</span>
                                )}
                            </Label>
                        </div>


                        <div className="flex-1" />

                        {/* View Switcher - Icons only on mobile */}
                        <div className="flex bg-muted/50 p-0.5 md:p-1 rounded-lg gap-0.5 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveView('planning')}
                                className={cn(
                                    "h-8 px-2 md:px-4 rounded-lg text-xs font-bold transition-all",
                                    activeView === 'planning' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <ListTodo className="w-3.5 h-3.5 md:mr-2" />
                                <span className="hidden md:inline">Lista</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveView('kanban')}
                                className={cn(
                                    "h-8 px-2 md:px-4 rounded-lg text-xs font-bold transition-all",
                                    activeView === 'kanban' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <LayoutGrid className="w-3.5 h-3.5 md:mr-2" />
                                <span className="hidden md:inline">Board</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveView('users')}
                                className={cn(
                                    "h-8 px-2 md:px-4 rounded-lg text-xs font-bold transition-all",
                                    activeView === 'users' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Building2 className="w-3.5 h-3.5 md:mr-2" />
                                <span className="hidden md:inline">Equipo</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seamless Content Area - Full Height */}
            <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-4 md:py-6 min-h-0 flex flex-col">
                {activeView === 'planning' && (
                    <TaskPlanningView
                        tasks={filteredTasks}
                        users={users}
                        clients={clients}
                        projects={projects}
                        columnWidths={columnWidths}
                        createResizeHandler={createResizeHandler}
                        onUpdate={(id: string, field: string, value: any) => updateTask(id, { [field]: value } as any)}
                        onDelete={deleteTask}
                        onEdit={(task: AllTask) => { setEditingTask(task); setIsEditDialogOpen(true); }}
                        onCreate={async (data: any) => createTask(data)}
                    />
                )}

                {activeView === 'kanban' && (
                    <TaskKanbanView
                        tasks={filteredTasks}
                        onUpdateStatus={(id, status) => updateTask(id, { status } as any)}
                        onEdit={(task) => { setEditingTask(task); setIsEditDialogOpen(true); }}
                        onDelete={deleteTask}
                        clients={clients}
                        projects={projects}
                    />
                )}

                {activeView === 'users' && (
                    <TaskUserList
                        tasks={filteredTasks}
                        users={users}
                        onUpdate={(id: string, data: Partial<AllTask>) => updateTask(id, data as any)}
                        onEdit={(task: AllTask) => { setEditingTask(task); setIsEditDialogOpen(true); }}
                        onDelete={deleteTask}
                    />
                )}
            </main>

            <TaskEditSheet
                task={editingTask}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSave={(id, data) => updateTask(id, data)}
                clients={clients}
                projects={projects}
            />
        </div>
    );
}

