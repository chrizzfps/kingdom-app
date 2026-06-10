import { useState, useEffect, useCallback } from 'react';
import { getAllTasks, createTask, updateTask, deleteTask, getProjects, getClients } from '@/api/crm';
import type { Task } from '@/types/crm';

export type AllTask = Task & {
    clientName?: string;
    clientId?: string;
    projectName?: string;
};

export function useAllTasks() {
    const [tasks, setTasks] = useState<AllTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadTasks = useCallback(async (options: { silent?: boolean } = {}) => {
        try {
            if (!options.silent) setIsLoading(true);
            const [tasksData, projectsData, clientsData] = await Promise.all([
                getAllTasks(),
                getProjects(),
                getClients()
            ]);

            const augmentedTasks: AllTask[] = tasksData.map(task => {
                const project = projectsData.find(p => p.id === task.projectId);
                // Priority: Task's explicit client > Project's client
                const effectiveClientId = task.clientId || project?.clientId;
                const client = clientsData.find(c => c.id === effectiveClientId);

                return {
                    ...task,
                    projectId: task.projectId,
                    clientId: effectiveClientId,
                    clientName: client?.name,
                    projectName: project?.name
                };
            });

            setTasks(augmentedTasks);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const handleUpdateTask = async (id: string, data: Partial<Task> & { clientId?: string }) => {
        // Optimistically update local state immediately
        setTasks(prev => {
            return prev.map(t => {
                if (t.id !== id) return t;
                return { ...t, ...data };
            });
        });

        // Perform actual update
        await updateTask(id, data);

        // Silently revalidate data in background to ensure consistency
        loadTasks({ silent: true });
    };

    const handleDeleteTask = async (id: string) => {
        // Optimistically remove
        setTasks(prev => prev.filter(t => t.id !== id));
        await deleteTask(id);
        loadTasks({ silent: true }); // Ensure names/refs are cleared if needed
    };

    const handleCreateTask = async (data: any) => {
        const id = await createTask(data);
        loadTasks({ silent: true }); // Silent refresh
        return id;
    };

    return {
        tasks,
        isLoading,
        error,
        updateTask: handleUpdateTask,
        deleteTask: handleDeleteTask,
        createTask: handleCreateTask,
        refresh: (options?: { silent?: boolean }) => loadTasks(options)
    };
}
