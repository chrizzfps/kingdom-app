import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getClient, getTasks, getInvoices } from '@/api/crm';
import type { Project, Client, Task, Invoice } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { ArrowLeft, Calendar, Users, FileText, Paperclip, Settings, Plus, ListTodo, LayoutGrid, Building2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProjectHeader } from '@/components/crm/projects/ProjectHeader';
import { ResourceList } from '@/components/crm/projects/ResourceList';
import { ProjectCalendar } from '@/components/crm/projects/ProjectCalendar';
import { TaskPlanningView } from "@/components/tasks/TaskPlanningView";
import { TaskKanbanView } from "@/components/tasks/TaskKanbanView";
import { TaskUserList } from "@/components/tasks/TaskUserList";
import { TaskEditSheet } from '@/components/tasks/TaskEditSheet';
import { MotionTabSwitcher } from '@/components/shared/MotionTabSwitcher';
import { TaskDialog } from '@/components/crm/projects/TaskDialog';
import { useUsers } from '@/hooks/useUsers';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useColumnResize } from '@/hooks/useColumnResize';
import { updateTask, deleteTask } from '@/api/crm';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'planning' | 'kanban' | 'users'>('planning'); // 'list' -> 'planning'
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null); // Using any to match AllTask partially
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const { isAdmin } = useRole();

    // Hooks for new views
    const { users } = useUsers();
    const { clients } = useClients();
    const { projects } = useProjects();

    const { columnWidths, createResizeHandler } = useColumnResize('project-tasks-planning', {
        status: 100,
        client: 0,
        project: 0,
        name: 300,
        assignee: 150,
        priority: 120,
        deadline: 120,
        actions: 80
    });

    const loadTasks = useCallback(async () => {
        if (!id) return;
        const t = await getTasks(id);
        setTasks(t);
    }, [id]);

    const filteredTasks = useMemo(() => {
        const filtered = tasks.filter(task => {
            const statusStr = task.status as string;
            const isCompleted = statusStr === 'completed' || statusStr === 'done';
            const shouldShow = showCompleted || !isCompleted;
            return shouldShow;
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
    }, [tasks, showCompleted]);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const p = await getProject(id);
                if (!p) {
                    navigate('/admin/proposals'); // Fallback
                    return;
                }
                setProject(p);
                if (p.clientId) {
                    const c = await getClient(p.clientId);
                    setClient(c);
                }
                const inv = await getInvoices();
                // Client-side filter for now or update API to support projectId
                setInvoices(inv.filter(i => i.projectId === id));
                await loadTasks();
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, loadTasks]);

    if (loading) return <KingdomLoader />;
    if (!project) return null;

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col px-2 md:px-0">
            {/* Header Area */}
            <div className="flex flex-col gap-4 md:gap-6 shrink-0 border-b border-border pb-4 md:pb-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/admin/projects')} className="shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg md:text-2xl font-bold tracking-tight truncate">
                            {project.name}
                        </h2>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
                        <Settings className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Config</span>
                    </Button>
                </div>

                {/* Stats - Hidden on Mobile, moved below tabs on mobile */}
                <div className="hidden md:block">
                    <ProjectHeader project={project} client={client || undefined} />
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="tasks" className="flex-1 flex flex-col min-h-0">
                <div className="shrink-0 mb-4 md:mb-6 -mx-2 px-2 overflow-x-auto scrollbar-none">
                    <TabsList className="bg-muted/50 p-1 w-auto inline-flex min-w-full md:w-full justify-start">
                        <TabsTrigger value="tasks" className="gap-1.5 md:gap-2 text-xs md:text-sm"><Users className="h-3.5 w-3.5 md:h-4 md:w-4" /><span className="hidden sm:inline">Tareas</span><span className="sm:hidden">Tareas</span></TabsTrigger>
                        <TabsTrigger value="resources" className="gap-1.5 md:gap-2 text-xs md:text-sm"><Paperclip className="h-3.5 w-3.5 md:h-4 md:w-4" /><span className="hidden sm:inline">Recursos</span></TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-1.5 md:gap-2 text-xs md:text-sm"><Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" /><span className="hidden sm:inline">Calendario</span></TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger value="invoices" className="gap-1.5 md:gap-2 text-xs md:text-sm"><FileText className="h-3.5 w-3.5 md:h-4 md:w-4" /><span className="hidden sm:inline">Facturación</span></TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <TabsContent value="tasks" className="h-full flex flex-col min-h-0 mt-0">
                        <div className="mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
                                <MotionTabSwitcher
                                    tabs={[
                                        { id: 'planning', label: 'Lista', icon: ListTodo },
                                        { id: 'kanban', label: 'Board', icon: LayoutGrid },
                                        { id: 'users', label: 'Equipo', icon: Building2 }
                                    ]}
                                    activeTab={activeView}
                                    onTabChange={(id) => setActiveView(id as any)}
                                    className="w-auto min-w-[200px] md:min-w-[320px]"
                                />

                                {activeView === 'planning' && (
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
                                            id="show-completed-project"
                                            checked={showCompleted}
                                            onCheckedChange={setShowCompleted}
                                            className="scale-75 data-[state=checked]:bg-zinc-200 dark:data-[state=checked]:bg-zinc-800 data-[state=checked]:[&>span]:!bg-black dark:data-[state=checked]:[&>span]:!bg-white data-[state=unchecked]:bg-zinc-600 dark:data-[state=unchecked]:bg-zinc-700 [&>span]:bg-white border-2 border-transparent transition-colors"
                                        />
                                        <Label
                                            htmlFor="show-completed-project"
                                            className="text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                                        >
                                            {showCompleted ? (
                                                <span className="text-primary font-bold">Ocultar completadas</span>
                                            ) : (
                                                <span className="text-muted-foreground">Mostrar completadas</span>
                                            )}
                                        </Label>
                                    </div>
                                )}
                            </div>
                            <Button size="sm" onClick={() => { setSelectedTask(null); setIsTaskDialogOpen(true); }} variant="contrast" className="shrink-0 self-end sm:self-auto">
                                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                                <span className="hidden sm:inline">Nueva Tarea</span>
                                <span className="sm:hidden">Nueva</span>
                            </Button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto pr-2 bg-white/50 dark:bg-transparent rounded-xl border border-border/50">
                            {activeView === 'planning' ? (
                                <TaskPlanningView
                                    tasks={filteredTasks.map(t => ({
                                        ...t,
                                        clientName: client?.name,
                                        projectName: project.name,
                                        projectId: project.id,
                                        clientId: project.clientId || ''
                                    }))}
                                    users={users}
                                    columnWidths={{ ...columnWidths, client: 0, project: 0 }} // Hide client/project columns
                                    createResizeHandler={createResizeHandler}
                                    onUpdate={async (taskId, field, val) => {
                                        // Optimistic update
                                        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, [field]: val } : t));
                                        await updateTask(taskId, { [field]: val });
                                        loadTasks(); // Silent refresh
                                    }}
                                    onDelete={async (taskId) => {
                                        if (confirm("¿Eliminar tarea?")) {
                                            setTasks(prev => prev.filter(t => t.id !== taskId));
                                            await deleteTask(taskId);
                                            toast.success("Tarea eliminada");
                                        }
                                    }}
                                    onEdit={(t) => { setEditingTask(t); setIsEditDialogOpen(true); }}
                                    clients={clients}
                                    projects={projects}
                                    onCreate={async (data) => {
                                        await updateTask('new', { ...data, projectId: project.id, clientId: project.clientId });
                                        loadTasks();
                                    }}
                                />
                            ) : activeView === 'kanban' ? (
                                <TaskKanbanView
                                    tasks={filteredTasks.map(t => ({
                                        ...t,
                                        clientName: client?.name,
                                        projectName: project.name,
                                        projectId: project.id,
                                        clientId: project.clientId || ''
                                    }))}
                                    onUpdateStatus={async (id, status) => {
                                        await updateTask(id, { status });
                                        loadTasks();
                                    }}
                                    onEdit={(t) => { setEditingTask(t); setIsEditDialogOpen(true); }}
                                    onDelete={async (id) => {
                                        if (confirm("¿Eliminar tarea?")) {
                                            await deleteTask(id);
                                            loadTasks();
                                            toast.success("Tarea eliminada");
                                        }
                                    }}
                                    clients={clients}
                                    projects={projects}
                                />
                            ) : (
                                <TaskUserList
                                    tasks={filteredTasks.map(t => ({
                                        ...t,
                                        clientName: client?.name,
                                        projectName: project.name,
                                        projectId: project.id,
                                        clientId: project.clientId || ''
                                    }))}
                                    users={users}
                                    onEdit={(t) => { setEditingTask(t); setIsEditDialogOpen(true); }}
                                    onDelete={async (id) => {
                                        if (confirm("¿Eliminar tarea?")) {
                                            await deleteTask(id);
                                            loadTasks();
                                            toast.success("Tarea eliminada");
                                        }
                                    }}
                                    onUpdate={async (taskId: string, data: any) => {
                                        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...data } : t));
                                        await updateTask(taskId, data);
                                        loadTasks();
                                    }}
                                />
                            )}
                        </div>

                        <TaskEditSheet
                            task={editingTask}
                            open={isEditDialogOpen}
                            onOpenChange={setIsEditDialogOpen}
                            onSave={async (id, data) => {
                                // Optimistic update
                                setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
                                await updateTask(id, data);
                                loadTasks();
                                toast.success("Tarea actualizada");
                            }}
                            clients={clients}
                            projects={projects}
                        />
                    </TabsContent>

                    <TabsContent value="resources" className="h-full overflow-y-auto pr-2 mt-0">
                        <ResourceList projectId={id || ''} />
                    </TabsContent>

                    <TabsContent value="calendar" className="h-full overflow-y-auto pr-2 mt-0">
                        <ProjectCalendar tasks={tasks} />
                    </TabsContent>

                    {/* Invoices Tab - Admin Only */}
                    {isAdmin && (
                        <TabsContent value="invoices" className="h-full overflow-y-auto pr-2 mt-0">

                            <div className="flex justify-end mb-4">
                                <Button onClick={() => navigate(`/admin/invoices/new?projectId=${id}&clientId=${project.clientId}`)} size="sm">
                                    <Plus className="h-4 w-4 mr-2" /> Nueva Factura
                                </Button>
                            </div>
                            <div className="grid gap-4">
                                {invoices.length > 0 ? (
                                    invoices.map(invoice => (
                                        <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/admin/invoices/${invoice.id}`)}>
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold flex items-center gap-2">
                                                        {invoice.number}
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                                            invoice.status === 'sent' ? 'bg-blue-500/10 text-blue-500' :
                                                                invoice.status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                                                                    'bg-zinc-500/10 text-zinc-500'
                                                            }`}>{invoice.status}</span>
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">{invoice.date ? new Date(invoice.date).toLocaleDateString() : '-'} — Vence: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">
                                                    {new Intl.NumberFormat('es-US', { style: 'currency', currency: invoice.currency }).format(invoice.total)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center border border-dashed rounded-lg bg-muted/10">
                                        <p className="text-muted-foreground">No hay facturas asociadas a este proyecto.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    )}
                </div>
            </Tabs>

            <TaskDialog
                open={isTaskDialogOpen}
                onOpenChange={setIsTaskDialogOpen}
                projectId={id || ''}
                task={selectedTask}
                onSuccess={loadTasks}
            />
        </div>
    );
}
