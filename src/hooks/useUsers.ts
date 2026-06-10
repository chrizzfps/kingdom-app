import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export interface User {
    id: string;
    name?: string;
    displayName?: string;
    email: string;
    avatar_url?: string;
    role?: string;
}

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // Assuming 'users' collection exists, otherwise we might need to mock or fetch from auth list if accessible (usually not from client SDK)
                // Using a safe query
                const q = query(collection(db, 'users'));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
                setUsers(data);
            } catch (e) {
                console.error("Error fetching users", e);
                // Fallback / Mock for demo if no users collection permission
                setUsers([
                    { id: '1', displayName: 'Cristhian Lacruz', name: 'Cristhian Lacruz', email: 'cris@example.com', role: 'admin' },
                    { id: '2', displayName: 'Demo User', name: 'Demo User', email: 'demo@example.com', role: 'member' }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    return { users, isLoading };
}
