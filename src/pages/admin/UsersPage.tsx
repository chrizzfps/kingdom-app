import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersList } from '@/components/admin/users/UsersList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { UserDialog } from '@/components/admin/users/UserDialog';

export default function UsersPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="space-y-4 md:space-y-6 max-w-4xl animate-in fade-in duration-500 px-2 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
                    <p className="text-sm md:text-base text-muted-foreground hidden sm:block">Gestiona el acceso y los roles de los miembros del equipo.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} variant="contrast" className="shrink-0 self-start sm:self-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Invitar Usuario</span>
                    <span className="sm:hidden">Invitar</span>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usuarios del Equipo</CardTitle>
                    <CardDescription>Lista completa de usuarios con acceso al sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UsersList />
                </CardContent>
            </Card>

            <UserDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={() => window.location.reload()} // Simple reload to refresh list for now, or context update
            />
        </div>
    );
}
