import { Navigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { KingdomLoader } from '@/components/ui/KingdomLoader';

interface RequireRoleProps {
    children: React.ReactNode;
    allowedRoles?: ('admin' | 'employee')[];
    module?: string;
    redirectTo?: string;
}

/**
 * Protects routes based on user role.
 * - If allowedRoles is provided, checks if user's role is in the list
 * - If module is provided, checks if user can access that module
 * - Redirects to specified path (default: /admin/dashboard) if unauthorized
 */
export function RequireRole({
    children,
    allowedRoles,
    module,
    redirectTo = '/admin/dashboard'
}: RequireRoleProps) {
    const { role, loading, canAccess } = useRole();

    if (loading) {
        return <KingdomLoader />;
    }

    // Check role-based access
    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return <Navigate to={redirectTo} replace />;
    }

    // Check module-based access
    if (module && !canAccess(module)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
