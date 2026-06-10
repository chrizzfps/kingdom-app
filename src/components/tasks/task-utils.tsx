
import {
    Clock,
    PlayCircle,
    AlertCircle,
    CheckCircle2,
    Circle,
    PauseCircle
} from "lucide-react";

export const columns = [
    { id: 'pending', title: 'Pendiente', icon: Clock },
    { id: 'in_progress', title: 'En Progreso', icon: PlayCircle },
    { id: 'review', title: 'En Revisión', icon: AlertCircle },
    { id: 'completed', title: 'Completado', icon: CheckCircle2 },
    { id: 'blocked', title: 'Bloqueado', icon: PauseCircle }
];

export const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'urgent': return "bg-red-100 text-red-900 border-red-200 dark:bg-red-900/40 dark:text-red-100 dark:border-red-800";
        case 'high': return "bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-800";
        case 'medium': return "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/40 dark:text-blue-100 dark:border-blue-800";
        case 'low': return "bg-zinc-100 text-zinc-900 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700";
        default: return "bg-zinc-100 text-zinc-900 border-zinc-200";
    }
};

export const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = { 'low': 'Baja', 'medium': 'Media', 'high': 'Alta', 'urgent': 'Urgente' };
    return labels[priority] || priority;
};

export const getStatusIcon = (status: string) => {
    switch (status) {
        case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
        case 'in_progress': return <PlayCircle className="w-4 h-4 text-blue-500" />;
        case 'review': return <AlertCircle className="w-4 h-4 text-amber-500" />;
        case 'blocked': return <PauseCircle className="w-4 h-4 text-red-500" />;
        default: return <Circle className="w-4 h-4 text-zinc-400" />;
    }
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return "text-emerald-600 dark:text-emerald-400";
        case 'in_progress': return "text-blue-600 dark:text-blue-400";
        case 'review': return "text-amber-600 dark:text-amber-400";
        case 'blocked': return "text-red-600 dark:text-red-400";
        default: return "text-zinc-600 dark:text-zinc-400";
    }
};
