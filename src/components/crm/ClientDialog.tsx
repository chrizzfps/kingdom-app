import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientSchema, type ClientFormData } from '@/types/clientSchema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import type { Client } from '@/types/crm';
import { createClient, updateClient } from '@/api/crm';
import { toast } from 'sonner';

interface ClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: Client | null;
    onSuccess: (client?: Client) => void;
}

// Extend Client to include status for form handling if it's missing in base type
type ClientWithStatus = Client & { status?: 'active' | 'inactive' | 'lead' };

export function ClientDialog({ open, onOpenChange, client, onSuccess }: ClientDialogProps) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ClientFormData>({
        resolver: zodResolver(ClientSchema),
        defaultValues: {
            status: 'active'
        }
    });
    const logoPreview = watch('logoUrl');

    useEffect(() => {
        if (client) {
            const clientData = client as ClientWithStatus;
            reset({
                ...clientData,
                status: clientData.status || 'active'
            });
        } else {
            reset({
                status: 'active'
            });
        }
    }, [client, reset, open]);

    const onSubmit = async (data: ClientFormData) => {
        setLoading(true);
        try {
            let resultClient: Client | undefined;
            if (client) {
                await updateClient(client.id, data);
                toast.success('Cliente actualizado correctamente');
                resultClient = { ...client, ...data } as Client; // Optimistic update
            } else {
                const newId = await createClient({ ...data, status: data.status || 'active' });
                toast.success('Cliente creado correctamente');

                // Construct optimistic client result
                resultClient = {
                    id: newId,
                    ...data,
                    status: data.status || 'active',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    // Include any other required fields for Client type if stricter
                } as Client;
            }
            onSuccess(resultClient);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar el cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                    <DialogDescription>
                        Complete la información del cliente. Los campos marcados son obligatorios.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* Brand Identity */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Identidad</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Interno *</Label>
                                <Input id="name" {...register('name')} placeholder="Ej. Nike" className={errors.name ? "border-destructive" : ""} />
                                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="commercialName">Nombre Comercial</Label>
                                <Input id="commercialName" {...register('commercialName')} placeholder="Nike Inc." />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Logo URL</Label>
                            <div className="flex gap-2">
                                <Input {...register('logoUrl')} placeholder="https://..." className={errors.logoUrl ? "border-destructive" : ""} />
                                {logoPreview && (
                                    <div className="h-10 w-10 shrink-0 rounded bg-muted flex items-center justify-center p-1 border">
                                        <img src={logoPreview} alt="Preview" className="h-full w-full object-contain" />
                                    </div>
                                )}
                            </div>
                            {errors.logoUrl && <p className="text-xs text-destructive">{errors.logoUrl.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select onValueChange={(val) => setValue('status', val as any)} defaultValue={(client as ClientWithStatus)?.status || 'active'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="inactive">Inactivo</SelectItem>
                                    <SelectItem value="lead">Prospecto (Lead)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border-t border-border/50" />

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contacto</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Principal *</Label>
                                <Input id="email" type="email" {...register('email')} className={errors.email ? "border-destructive" : ""} />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" {...register('phone')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Sitio Web</Label>
                            <Input id="website" {...register('website')} placeholder="https://" className={errors.website ? "border-destructive" : ""} />
                            {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
                        </div>
                    </div>

                    <div className="border-t border-border/50" />

                    {/* Legal / Fiscal */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Datos Fiscales</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="taxId">CIF / NIF / RFC</Label>
                                <Input id="taxId" {...register('taxId')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="legalName">Razón Social</Label>
                                <Input id="legalName" {...register('legalName')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fiscalAddress">Dirección Fiscal</Label>
                            <Textarea id="fiscalAddress" {...register('fiscalAddress')} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading} variant="contrast" className="w-full md:w-auto font-bold">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {client ? 'Guardar Cambios' : 'Crear Cliente'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
