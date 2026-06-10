import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export type UserRole = 'admin' | 'employee' | null;

// Modules that employees can access
const EMPLOYEE_ALLOWED_MODULES = [
    'dashboard',
    'portfolios',
    'clients', // View only
    'projects', // No invoices tab
    'tasks',
    'social',
];

interface UseRoleReturn {
    role: UserRole;
    isAdmin: boolean;
    isEmployee: boolean;
    loading: boolean;
    canAccess: (module: string) => boolean;
    canEdit: (module: string) => boolean;
}

export function useRole(): UseRoleReturn {
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        // Map 'member' to 'employee' for backwards compatibility
                        const userRole = userData.role === 'member' ? 'employee' : userData.role;
                        setRole(userRole as UserRole);
                    } else {
                        // Default to employee if no role set
                        setRole('employee');
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    setRole('employee'); // Default to restricted access on error
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const isAdmin = role === 'admin';
    const isEmployee = role === 'employee';

    const canAccess = useCallback((module: string): boolean => {
        if (loading || !role) return false;
        if (isAdmin) return true;
        return EMPLOYEE_ALLOWED_MODULES.includes(module);
    }, [role, loading, isAdmin]);

    const canEdit = useCallback((module: string): boolean => {
        if (loading || !role) return false;
        if (isAdmin) return true;
        // Employees can edit most things except clients
        if (module === 'clients') return false;
        return EMPLOYEE_ALLOWED_MODULES.includes(module);
    }, [role, loading, isAdmin]);

    return {
        role,
        isAdmin,
        isEmployee,
        loading,
        canAccess,
        canEdit,
    };
}
