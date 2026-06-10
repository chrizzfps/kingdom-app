import { useState, useEffect } from 'react';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { getUsers, deleteUser } from '@/api/crm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Shield, User, Eye, Trash2, Banknote } from 'lucide-react';
import { UserDialog } from './UserDialog';
import { UserPaymentsDialog } from './UserPaymentsDialog';
import { toast } from 'sonner';

export function UsersList() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
    const [userForPayments, setUserForPayments] = useState<any | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error loading users:", error);
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    if (loading) return <KingdomLoader />;

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleOpenPayments = (user: any) => {
        setUserForPayments(user);
        setIsPaymentsOpen(true);
    };

    const handleDelete = async (user: any) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.displayName || user.email}?`)) return;

        try {
            await deleteUser(user.id);
            toast.success('Usuario eliminado');
            loadUsers();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar usuario');
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="h-4 w-4 text-red-500" />;
            case 'member': return <User className="h-4 w-4 text-blue-500" />;
            default: return <Eye className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <>
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
                {users.map((u) => (
                    <div key={u.id} className="p-4 rounded-lg border border-border bg-card">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <span className="font-semibold text-foreground block truncate">{u.displayName || 'Sin nombre'}</span>
                                <span className="text-xs text-muted-foreground truncate block">{u.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {getRoleIcon(u.role)}
                                <Badge variant="outline" className="capitalize text-[10px]">{u.role || 'viewer'}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/50">
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleOpenPayments(u)} title="Ver Pagos">
                                <Banknote className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleEdit(u)} title="Editar">
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u)} title="Eliminar">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                {users.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No se encontraron usuarios.
                    </div>
                )}
            </div>

            {/* Desktop Table Layout */}
            <div className="rounded-md border hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{u.displayName || 'Sin nombre'}</span>
                                        <span className="text-xs text-muted-foreground">{u.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getRoleIcon(u.role)}
                                        <Badge variant="outline" className="capitalize">{u.role || 'viewer'}</Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {u.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleOpenPayments(u)} title="Ver Pagos">
                                            <Banknote className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleEdit(u)} title="Editar">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u)} title="Eliminar">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No se encontraron usuarios.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div >

            <UserDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                user={selectedUser}
                onSuccess={loadUsers}
            />

            <UserPaymentsDialog
                open={isPaymentsOpen}
                onOpenChange={setIsPaymentsOpen}
                user={userForPayments}
            />
        </>
    );
}

