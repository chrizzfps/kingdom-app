import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateUserProfile, registerUser, getUserPrivateProfile } from '@/api/crm';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: any | null; // UserProfile
    onSuccess: () => void;
}

export function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [fetchingPrivate, setFetchingPrivate] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            if (user) {
                setFetchingPrivate(true);
                // Fetch sensitive data (will satisfy if permission allowed, else null)
                const privateData = await getUserPrivateProfile(user.id);
                setFetchingPrivate(false);

                reset({
                    email: user.email,
                    role: user.role || 'viewer',
                    displayName: user.displayName || '',
                    phone: user.phone || '',
                    position: user.position || '',
                    salary: privateData?.salary || user.salary || '',
                    currency: privateData?.currency || user.currency || 'EUR',
                    paymentMethod: privateData?.paymentMethod || user.paymentMethod || '',
                    paymentDetails: privateData?.paymentDetails || user.paymentDetails || '',
                    notes: privateData?.notes || user.notes || '',
                    status: user.status || 'active',
                    password: ''
                });
            } else {
                reset({
                    role: 'viewer',
                    email: '',
                    displayName: '',
                    phone: '',
                    position: '',
                    salary: '',
                    currency: 'EUR',
                    paymentMethod: '',
                    paymentDetails: '',
                    notes: '',
                    status: 'active',
                    password: ''
                });
            }
        };

        if (open) {
            loadUserData();
        }
    }, [user, reset, open]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            if (user) {
                // Update full profile
                await updateUserProfile(user.id, {
                    displayName: data.displayName,
                    role: data.role,
                    phone: data.phone,
                    position: data.position,
                    salary: data.salary ? Number(data.salary) : undefined,
                    currency: data.currency,
                    paymentMethod: data.paymentMethod,
                    paymentDetails: data.paymentDetails,
                    notes: data.notes,
                    status: data.status
                });
                toast.success('Usuario actualizado');
            } else {
                if (!data.password || data.password.length < 6) {
                    toast.error('La contraseña debe tener al menos 6 caracteres');
                    setLoading(false);
                    return;
                }
                const uid = await registerUser(data.email, data.password, data.displayName, data.role);
                // Also update the rest of the profile for new user
                await updateUserProfile(uid, {
                    phone: data.phone,
                    position: data.position,
                    salary: data.salary ? Number(data.salary) : undefined,
                    currency: data.currency,
                    paymentMethod: data.paymentMethod,
                    paymentDetails: data.paymentDetails,
                    notes: data.notes,
                    status: data.status
                });
                toast.success('Usuario creado exitosamente');
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error('El correo ya está registrado');
            } else {
                toast.error('Error al guardar usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!user || !user.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast.success('Correo de restablecimiento enviado');
        } catch (error) {
            toast.error('Error al enviar correo');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{user ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</DialogTitle>
                    <DialogDescription>
                        {user ? 'Actualiza la información del perfil y datos de empleado.' : 'Crea una nueva cuenta de acceso y perfil de empleado.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                {...register('email', { required: true })}
                                disabled={!!user || fetchingPrivate}
                                placeholder="correo@empresa.com"
                                className={!!user ? "bg-muted" : ""}
                            />
                            {user && <p className="text-[10px] text-muted-foreground">El email no se puede cambiar aquí.</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Nombre Completo</Label>
                            <Input {...register('displayName', { required: "El nombre es obligatorio" })} placeholder="Juan Pérez" />
                            {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>WhatsApp / Teléfono</Label>
                            <Input {...register('phone')} placeholder="+34 600 000 000" />
                        </div>

                        <div className="space-y-2">
                            <Label>Cargo / Posición</Label>
                            <Input {...register('position')} placeholder="Ej. Media Buyer, Designer..." />
                        </div>

                        <div className="space-y-2">
                            <Label>Sueldo / Pago Base</Label>
                            <div className="flex gap-2">
                                <Input type="number" {...register('salary')} placeholder="1500" className="flex-1" />
                                <Select onValueChange={(v) => setValue('currency', v)} defaultValue={watch('currency') || 'EUR'}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Método de Pago</Label>
                            <Input {...register('paymentMethod')} placeholder="PayPal, Revolut, Transferencia..." />
                        </div>

                        <div className="space-y-2 col-span-full">
                            <Label>Detalles de Pago (Cuenta, ID, etc.)</Label>
                            <Input {...register('paymentDetails')} placeholder="IBAN o email de cuenta de pago" />
                        </div>

                        {!user && (
                            <div className="space-y-2 col-span-full">
                                <Label className="text-primary font-bold">Contraseña Inicial</Label>
                                <Input
                                    type="password"
                                    {...register('password', { required: "La contraseña es obligatoria", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
                                    placeholder="********"
                                />
                                {errors.password && <p className="text-xs text-destructive">{errors.password.message as string}</p>}
                                <p className="text-[10px] text-muted-foreground">Mínimo 6 caracteres.</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Rol en el Sistema</Label>
                            <Select onValueChange={(v) => setValue('role', v)} value={watch('role') || 'viewer'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="employee">Empleado</SelectItem>
                                    <SelectItem value="viewer">Visualizador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select onValueChange={(v) => setValue('status', v)} value={watch('status') || 'active'}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="on_vacation">Inactivo / Vacaciones</SelectItem>
                                    <SelectItem value="inactive">Baja</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-full space-y-2">
                            <Label>Notas Internas</Label>
                            <Textarea {...register('notes')} placeholder="Notas sobre el contrato, habilidades, etc." className="min-h-[80px]" />
                        </div>
                    </div>

                    {user && (
                        <div className="pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={handleResetPassword} className="w-full text-xs">
                                Enviar correo para cambiar contraseña
                            </Button>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={loading || fetchingPrivate} variant="contrast" className="w-full md:w-auto font-bold">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {user ? 'Guardar Cambios' : 'Registrar Usuario'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
