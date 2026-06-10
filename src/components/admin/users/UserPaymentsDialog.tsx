import { useState, useEffect } from 'react';
import { useRole as useUserRole } from '@/hooks/useRole';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getUserPayments, addUserPayment, deleteUserPayment } from '@/api/crm';
import type { UserProfile, UserPayment } from '@/types/crm';
import { Loader2, Plus, Trash2, Banknote, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserPaymentsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserProfile | null;
}

export function UserPaymentsDialog({ open, onOpenChange, user }: UserPaymentsDialogProps) {
    const [payments, setPayments] = useState<UserPayment[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // New payment form state
    const [newPayment, setNewPayment] = useState({
        amount: '',
        currency: 'EUR' as any,
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [submitting, setSubmitting] = useState(false);
    const { isAdmin } = useUserRole();

    useEffect(() => {
        if (open && user) {
            loadPayments();
        }
    }, [open, user]);

    const loadPayments = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserPayments(user.id);
            setPayments(data);
        } catch (error: any) {
            console.error('Error loading payments:', error);
            if (error?.code === 'permission-denied') {
                toast.error('Acceso denegado', {
                    description: 'No tienes permisos para ver los pagos. Verifica que eres Administrador.'
                });
            } else {
                toast.error('Error al cargar pagos', {
                    description: error?.message || 'Ocurrió un error inesperado'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!newPayment.amount || !newPayment.description) {
            toast.error('Completa los campos obligatorios');
            return;
        }

        setSubmitting(true);
        try {
            await addUserPayment({
                userId: user.id,
                amount: Number(newPayment.amount),
                currency: newPayment.currency,
                description: newPayment.description,
                date: new Date(newPayment.date),
                status: 'completed'
            });
            toast.success('Pago registrado exitosamente');
            setIsAdding(false);
            setNewPayment({
                amount: '',
                currency: 'EUR',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            loadPayments();
        } catch (error: any) {
            console.error('Error adding payment:', error);
            if (error?.code === 'permission-denied') {
                toast.error('Permiso denegado', {
                    description: 'Solo los administradores pueden registrar pagos.'
                });
            } else {
                toast.error('Error al registrar pago');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este registro de pago?')) return;
        try {
            await deleteUserPayment(id);
            toast.success('Pago eliminado');
            loadPayments();
        } catch (error: any) {
            console.error('Error deleting payment:', error);
            toast.error('Error al eliminar', {
                description: 'Verifica tus permisos de administrador.'
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-primary" />
                        <DialogTitle>Pagos de {user?.displayName || 'Usuario'}</DialogTitle>
                    </div>
                    <DialogDescription>
                        Historial de pagos y remuneraciones realizadas a este empleado.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {isAdding ? (
                        <form onSubmit={handleAddPayment} className="p-4 border rounded-xl bg-muted/30 space-y-3 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-sm font-bold">Registrar Nuevo Pago</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase">Monto</Label>
                                    <div className="flex gap-1">
                                        <Input
                                            type="number"
                                            value={newPayment.amount}
                                            onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="h-8"
                                            required
                                        />
                                        <Select value={newPayment.currency} onValueChange={v => setNewPayment({ ...newPayment, currency: v })}>
                                            <SelectTrigger className="h-8 w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase">Fecha</Label>
                                    <Input
                                        type="date"
                                        value={newPayment.date}
                                        onChange={e => setNewPayment({ ...newPayment, date: e.target.value })}
                                        className="h-8"
                                        required
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label className="text-[10px] uppercase">Concepto / Descripción</Label>
                                    <Input
                                        value={newPayment.description}
                                        onChange={e => setNewPayment({ ...newPayment, description: e.target.value })}
                                        placeholder="Ej: Nómina Diciembre, Bonus..."
                                        className="h-8"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={submitting}>Cancelar</Button>
                                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold" disabled={submitting}>
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Guardar Pago
                                </Button>
                            </div>
                        </form>
                    ) : (
                        isAdmin && (
                            <Button
                                variant="outline"
                                className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5 h-10 gap-2"
                                onClick={() => setIsAdding(true)}
                            >
                                <Plus className="h-4 w-4" /> Registrar Pago
                            </Button>
                        )
                    )}

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Historial Reciente</Label>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : payments.length > 0 ? (
                            payments.map(payment => (
                                <div key={payment.id} className="group flex items-center justify-between p-3 border rounded-xl hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                            <Banknote className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold leading-none">{payment.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    {format(payment.date, "d 'de' MMMM, yyyy", { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-foreground">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                                            </p>
                                        </div>
                                        {isAdmin && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all"
                                                onClick={() => handleDelete(payment.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 border border-dashed rounded-xl bg-muted/10">
                                <p className="text-xs text-muted-foreground">No hay registros de pagos para este usuario.</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
