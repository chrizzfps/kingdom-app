
import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AllTask } from "@/hooks/useAllTasks";
import type { Client, Project } from "@/types/crm";
import { columns } from "./task-utils";
import { Calendar, Tag, Building2, Briefcase, FileText, Layout, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TaskEditSheetProps {
    task: AllTask | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, data: any) => Promise<void>;
    clients: Client[];
    projects: Project[];
}

export function TaskEditSheet({ task, open, onOpenChange, onSave, clients, projects }: TaskEditSheetProps) {
    const [selectedClientId, setSelectedClientId] = useState<string>(task?.clientId || "");
    const [selectedProjectId, setSelectedProjectId] = useState<string>(task?.projectId || "");

    useEffect(() => {
        if (task) {
            setSelectedClientId(task.clientId || "");
            setSelectedProjectId(task.projectId || "");
        }
    }, [task]);

    // Filter projects based on selected client
    const availableProjects = useMemo(() => {
        if (!selectedClientId) return [];
        return projects.filter(p => p.clientId === selectedClientId);
    }, [selectedClientId, projects]);

    if (!task) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Ensure we send valid IDs or null
        const projectId = selectedProjectId && selectedProjectId !== "none" ? selectedProjectId : null;

        const data: any = {
            title: formData.get('title'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
            description: formData.get('description') || null,
            projectId: projectId,
            // We usually don't need to send clientId if projectId is present, 
            // but if the task can be orphan or we want to update the cache/denormalized data:
            clientId: selectedClientId && selectedClientId !== "none" ? selectedClientId : null
        };

        await onSave(task.id, data);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
                <SheetHeader className="pb-6">
                    <SheetTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Layout className="h-5 w-5 text-muted-foreground" />
                        Detalles de Tarea
                    </SheetTitle>
                    <SheetDescription>
                        Información detallada y ajustes de la tarea
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-180px)] pr-6 -mr-6 px-1">
                    <form onSubmit={handleSubmit} id="edit-task-form" className="space-y-8 pb-10">
                        {/* Header Info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Nombre de la Tarea</Label>
                                <Input
                                    name="title"
                                    defaultValue={task.title}
                                    required
                                    className="text-lg font-semibold h-auto py-2 focus-visible:ring-primary border-none bg-muted/30 px-3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Tag className="h-3 w-3" /> Estado
                                    </Label>
                                    <Select name="status" defaultValue={task.status}>
                                        <SelectTrigger className="bg-muted/40 border-border/50 h-10 ring-offset-background focus:ring-1 focus:ring-primary text-foreground font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns.map(col => (
                                                <SelectItem key={col.id} value={col.id} className="gap-2 focus:bg-accent focus:text-accent-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full",
                                                            col.id === 'pending' ? "bg-muted-foreground/30" :
                                                                col.id === 'in_progress' ? "bg-blue-500" :
                                                                    col.id === 'review' ? "bg-orange-500" :
                                                                        col.id === 'completed' ? "bg-green-500" :
                                                                            "bg-red-500"
                                                        )} />
                                                        <span className="text-sm font-medium">{col.title}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <AlertCircle className="h-3 w-3" /> Prioridad
                                    </Label>
                                    <Select name="priority" defaultValue={task.priority}>
                                        <SelectTrigger className="bg-muted/40 border-border/50 h-10 ring-offset-background focus:ring-1 focus:ring-primary text-foreground font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low" className="font-medium text-foreground">Baja</SelectItem>
                                            <SelectItem value="medium" className="font-medium text-foreground">Media</SelectItem>
                                            <SelectItem value="high" className="font-medium text-foreground">Alta</SelectItem>
                                            <SelectItem value="urgent" className="font-bold text-red-500">Urgente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        {/* Context Info (Editable) */}
                        <div className="space-y-4">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Contexto del Proyecto</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Building2 className="h-3 w-3" /> Cliente
                                    </Label>
                                    <Select
                                        value={selectedClientId}
                                        onValueChange={(val) => {
                                            setSelectedClientId(val);
                                            setSelectedProjectId(""); // Reset project when client changes
                                        }}
                                    >
                                        <SelectTrigger className="bg-muted/40 border-border/50 h-10 w-full text-foreground font-medium">
                                            <SelectValue placeholder="Seleccionar Cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- Sin Cliente --</SelectItem>
                                            {clients.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Briefcase className="h-3 w-3" /> Proyecto
                                    </Label>
                                    <Select
                                        value={selectedProjectId}
                                        onValueChange={setSelectedProjectId}
                                        disabled={!selectedClientId || selectedClientId === "none"}
                                    >
                                        <SelectTrigger className="bg-muted/40 border-border/50 h-10 w-full text-foreground font-medium">
                                            <SelectValue placeholder="Seleccionar Proyecto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- Sin Proyecto --</SelectItem>
                                            {availableProjects.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        {/* Schedule */}
                        <div className="space-y-4">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" /> Planificación
                            </Label>
                            <div className="space-y-2">
                                <Label className="text-xs">Fecha Límite</Label>
                                <Input
                                    type="date"
                                    name="dueDate"
                                    defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                    className="bg-muted/30 border-none h-10"
                                />
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        {/* Resources */}
                        <div className="space-y-4">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Tag className="h-3 w-3" /> Recursos
                            </Label>
                            <div className="space-y-2">
                                <Input
                                    name="newResource"
                                    placeholder="Añadir URL del recurso..."
                                    className="bg-muted/30 border-none h-10 text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            // Simple logical placeholder: In a real app we'd have a state array for resources
                                            // For now, this form just collects existing data. 
                                            // To implement resource adding, we need local state in this sheet.
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-muted-foreground">Presiona Enter para añadir (Próximamente)</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {task.resources?.map((res, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-md border border-border/50">
                                            <span className="text-xs truncate max-w-[150px]">{res.title || res.url}</span>
                                            <Button type="button" variant="ghost" size="icon" className="h-4 w-4 hover:bg-destructive/20 hover:text-destructive rounded-full">
                                                <span className="sr-only">Eliminar</span>
                                                <span className="text-[10px] font-bold">×</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        {/* Notes */}
                        <div className="space-y-4">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <FileText className="h-3 w-3" /> Descripción
                            </Label>
                            <Textarea
                                name="description"
                                defaultValue={task.description || ''}
                                rows={6}
                                placeholder="Escribe detalles adicionales sobre esta tarea..."
                                className="bg-muted/30 border-none resize-none focus-visible:ring-primary p-3"
                            />
                        </div>
                    </form>
                </ScrollArea>

                <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t">
                    <div className="flex w-full gap-3">
                        <Button variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" form="edit-task-form" className="flex-1 bg-[#0f0f0f] text-white dark:bg-white dark:text-black">
                            Guardar Cambios
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
