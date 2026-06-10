import { useState, useEffect } from 'react';
import { getProjects } from '@/api/crm';
import type { Project } from '@/types/crm';

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    return { projects, isLoading };
}
