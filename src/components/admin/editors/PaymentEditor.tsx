import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CreditCard, Wallet, Send, Save, Loader2 } from 'lucide-react';
import type { ProposalModule } from '@/types/proposal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGlobalPaymentMethods } from '@/hooks/useGlobalPaymentMethods';
import { toast } from 'sonner';

interface EditorProps {
    module: ProposalModule;
    onUpdate: (data: any) => void;
}

type PaymentType = 'BANK' | 'PAYPAL' | 'BITCOIN' | 'BINANCE' | 'ZELLE' | 'ZINLI' | 'BOLIVARES';

const PAYMENT_TYPES: { id: PaymentType; label: string; icon: any }[] = [
    { id: 'BANK',     label: 'Transferencia Bancaria', icon: CreditCard },
    { id: 'PAYPAL',   label: 'PayPal',                 icon: Wallet },
    { id: 'BITCOIN',  label: 'Bitcoin / Crypto',       icon: Wallet },
    { id: 'BINANCE',  label: 'Binance Pay',            icon: Wallet },
    { id: 'ZELLE',    label: 'Zelle',                  icon: Send },
    { id: 'ZINLI',    label: 'Zinli',                  icon: Send },
    { id: 'BOLIVARES', label: 'Pago en Bolívares',     icon: CreditCard },
];

export function PaymentEditor({ module, onUpdate }: EditorProps) {
    const data = module.data;
    const milestones = data.milestones || [];

    const { methods, loading, saving, save: saveGlobal, setMethods } = useGlobalPaymentMethods();

    const handleChange = (field: string, value: any) => {
        onUpdate({ [field]: value });
    };

    // --- Global Methods ---
    const addMethod = () => {
        const newMethod = { id: crypto.randomUUID(), type: 'BANK', details: {} };
        setMethods([...methods, newMethod]);
    };

    const updateMethod = (index: number, field: string, value: any) => {
        const updated = [...methods];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            updated[index] = { ...updated[index], [parent]: { ...(updated[index] as any)[parent], [child]: value } };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setMethods(updated);
    };

    const removeMethod = (index: number) => {
        setMethods(methods.filter((_, i) => i !== index));
    };

    const handleSaveGlobal = async () => {
        await saveGlobal(methods);
        toast.success('Métodos de pago guardados globalmente');
    };

    // --- Milestones ---
    const addMilestone = () => handleChange('milestones', [...milestones, { label: '', amount: '', date: '' }]);
    const updateMilestone = (index: number, field: string, value: string) => {
        const updated = [...milestones];
        updated[index] = { ...updated[index], [field]: value };
        handleChange('milestones', updated);
    };
    const removeMilestone = (index: number) => handleChange('milestones', milestones.filter((_: any, i: number) => i !== index));

    return (
        <div className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="general">Términos y Cronograma</TabsTrigger>
                    <TabsTrigger value="methods">Métodos de Pago</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <div className="space-y-4">
                        <Label>Términos Generales</Label>
                        <Textarea
                            value={data.terms || ''}
                            onChange={e => handleChange('terms', e.target.value)}
                            placeholder="Ej: 50% anticipo, 50% contra entrega..."
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">Cronograma de Pagos</Label>
                            <Button variant="outline" size="sm" onClick={addMilestone} className="gap-2">
                                <Plus className="w-4 h-4" /> Agregar Hito
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {milestones.map((milestone: any, index: number) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <Input
                                        placeholder="Concepto"
                                        value={milestone.label}
                                        onChange={e => updateMilestone(index, 'label', e.target.value)}
                                        className="flex-grow"
                                    />
                                    <Input
                                        placeholder="Monto"
                                        value={milestone.amount}
                                        onChange={e => updateMilestone(index, 'amount', e.target.value)}
                                        className="w-24"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeMilestone(index)} className="text-red-500 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="methods" className="space-y-6">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                        Estos métodos son <strong>globales</strong> — se muestran igual en todas las propuestas. Guarda los cambios para que apliquen a todas.
                    </div>

                    <div className="flex justify-between items-center">
                        <Label className="text-base font-semibold">Métodos Activos</Label>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={addMethod} disabled={loading}>
                                <Plus className="w-4 h-4 mr-2" /> Nuevo
                            </Button>
                            <Button size="sm" variant="contrast" onClick={handleSaveGlobal} disabled={saving || loading} className="gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Guardar
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">Cargando...</div>
                    ) : methods.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                            Agrega métodos de pago globales.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {methods.map((method, index) => (
                                <div key={method.id} className="border rounded-lg p-4 bg-card space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="w-1/3">
                                            <Label className="text-xs mb-1.5 block">Tipo</Label>
                                            <Select value={method.type} onValueChange={val => updateMethod(index, 'type', val)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PAYMENT_TYPES.map(t => (
                                                        <SelectItem key={t.id} value={t.id}>
                                                            <div className="flex items-center gap-2">
                                                                <t.icon className="w-3 h-3" /> {t.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-grow pt-6 flex justify-end">
                                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeMethod(index)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                        {(method.type === 'BANK' || method.type === 'BOLIVARES') && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label>Banco</Label>
                                                    <Input value={(method.details as any)?.bankName || ''} onChange={e => updateMethod(index, 'details.bankName', e.target.value)} placeholder="Nombre del Banco" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Titular</Label>
                                                    <Input value={(method.details as any)?.holderName || ''} onChange={e => updateMethod(index, 'details.holderName', e.target.value)} placeholder="Nombre del Titular" />
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <Label>Número de Cuenta</Label>
                                                    <Input value={(method.details as any)?.accountNumber || ''} onChange={e => updateMethod(index, 'details.accountNumber', e.target.value)} placeholder="0000000000" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>ID / RIF / Cédula</Label>
                                                    <Input value={(method.details as any)?.idNumber || ''} onChange={e => updateMethod(index, 'details.idNumber', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{method.type === 'BOLIVARES' ? 'Pago Móvil (Opcional)' : 'SWIFT / BIC'}</Label>
                                                    <Input value={(method.details as any)?.swift || ''} onChange={e => updateMethod(index, 'details.swift', e.target.value)} />
                                                </div>
                                            </>
                                        )}
                                        {method.type === 'PAYPAL' && (
                                            <>
                                                <div className="space-y-2 col-span-2">
                                                    <Label>Correo PayPal</Label>
                                                    <Input value={(method.details as any)?.email || ''} onChange={e => updateMethod(index, 'details.email', e.target.value)} placeholder="correo@paypal.com" />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label>Nombre del Titular</Label>
                                                    <Input value={(method.details as any)?.holderName || ''} onChange={e => updateMethod(index, 'details.holderName', e.target.value)} />
                                                </div>
                                            </>
                                        )}
                                        {(method.type === 'ZELLE' || method.type === 'ZINLI') && (
                                            <>
                                                <div className="space-y-2 col-span-2">
                                                    <Label>Correo / Teléfono Asociado</Label>
                                                    <Input value={(method.details as any)?.email || ''} onChange={e => updateMethod(index, 'details.email', e.target.value)} />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label>Nombre del Titular</Label>
                                                    <Input value={(method.details as any)?.holderName || ''} onChange={e => updateMethod(index, 'details.holderName', e.target.value)} />
                                                </div>
                                            </>
                                        )}
                                        {(method.type === 'BITCOIN' || method.type === 'BINANCE') && (
                                            <>
                                                <div className="space-y-2 col-span-2">
                                                    <Label>{method.type === 'BINANCE' ? 'Binance ID / Pay Email' : 'Dirección de Wallet'}</Label>
                                                    <Input value={(method.details as any)?.wallet || ''} onChange={e => updateMethod(index, 'details.wallet', e.target.value)} className="font-mono" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Red (Network)</Label>
                                                    <Input value={(method.details as any)?.network || ''} onChange={e => updateMethod(index, 'details.network', e.target.value)} placeholder="Ej: TRC20, BEP20" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Moneda</Label>
                                                    <Input value={(method.details as any)?.currency || ''} onChange={e => updateMethod(index, 'details.currency', e.target.value)} placeholder="Ej: USDT, BTC" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
