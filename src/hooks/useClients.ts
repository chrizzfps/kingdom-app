import { useState, useEffect } from 'react';
import { getClients } from '@/api/crm';
import type { Client } from '@/types/crm';

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getClients();
                setClients(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    return { clients, isLoading };
}
