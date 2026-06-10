import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProposalModule } from '@/types/proposal';
import { ValidatedInput } from '@/components/admin/ValidatedInput';
import { HelpPanel } from '@/components/admin/HelpPanel';
import { cn } from '@/lib/utils';

interface EditorProps {
    module: ProposalModule;
    onUpdate: (data: any) => void;
    allModules?: ProposalModule[];
}

interface GlobalItem {
    id: string;
    name: string;
    price: number;
}

export function PricingEditor({ module, onUpdate, allModules }: EditorProps) {
    const data = module.data || {};
    const globalItems: GlobalItem[] = data.globalItems || [];
    const allocations: Record<string, string[]> = data.allocations || {};

    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [isItemsOpen, setIsItemsOpen] = useState(true);

    // Find Options Module Data (read-only for option titles)
    const optionsModule = allModules?.find(m => m.type === 'OPTIONS');
    const options = optionsModule?.data?.options || [];

    const handleUpdate = (updates: any) => {
        onUpdate({ ...data, ...updates });
    };

    // --- Master Items Management ---
    const addGlobalItem = () => {
        if (!newItemName.trim()) return;

        const newItem: GlobalItem = {
            id: crypto.randomUUID(),
            name: newItemName.trim(),
            price: Number(newItemPrice) || 0
        };

        handleUpdate({ globalItems: [...globalItems, newItem] });
        setNewItemName('');
        setNewItemPrice('');
    };

    const updateItem = (index: number, updates: Partial<GlobalItem>) => {
        const newItems = [...globalItems];
        newItems[index] = { ...newItems[index], ...updates };
        handleUpdate({ globalItems: newItems });
    };

    const removeItem = (id: string) => {
        handleUpdate({
            globalItems: globalItems.filter(i => i.id !== id)
        });
    };

    const handleItemKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addGlobalItem();
        }
    };

    // --- Allocation Management ---
    const toggleItemAllocation = (optionId: string, itemId: string) => {
        const current = allocations[optionId] || [];
        let updated;
        if (current.includes(itemId)) {
            updated = current.filter(id => id !== itemId);
        } else {
            updated = [...current, itemId];
        }
        handleUpdate({
            allocations: { ...allocations, [optionId]: updated }
        });
    };

    const calculateTotal = (optionId: string) => {
        const itemIds = allocations[optionId] || [];
        return itemIds.reduce((sum, itemId) => {
            const item = globalItems.find(i => i.id === itemId);
            return sum + (item?.price || 0);
        }, 0);
    };

    return (
        <div className="space-y-8">
            <HelpPanel title="Configuración de Costos (Pricing)">
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Lista Maestra:</strong> Define cada servicio/item con su precio base.</li>
                    <li><strong>Asignación por Paquete:</strong> Selecciona qué items incluye cada opción (definidas en el módulo Opciones).</li>
                    <li><strong>Detalles del Documento:</strong> Configura título, validez y datos del cliente para el encabezado.</li>
                </ul>
            </HelpPanel>

            {/* --- Collapsible Master Items Section (using simple toggle) --- */}
            <div className="bg-card/40 rounded-xl border border-border/60 overflow-hidden">
                <button
                    onClick={() => setIsItemsOpen(!isItemsOpen)}
                    className="w-full flex items-center justify-between p-4 hover:bg-card/60 transition-colors text-left"
                >
                    <Label className="text-base font-semibold cursor-pointer">
                        Configuración de Costos (Pricing)
                    </Label>
                    {isItemsOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>

                {isItemsOpen && (
                    <div className="p-6 pt-2 space-y-6 border-t border-border/40">
                        {/* Master Items List */}
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary" />
                                Lista Maestra de Items y Costos
                            </Label>

                            {/* Add New Item */}
                            <div className="flex gap-2 items-end">
                                <div className="flex-grow space-y-1">
                                    <Label className="text-xs text-muted-foreground">Nombre del Servicio</Label>
                                    <Input
                                        placeholder="Ej. Hosting Anual"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        onKeyDown={handleItemKeyDown}
                                        className="bg-background"
                                    />
                                </div>
                                <div className="w-32 space-y-1">
                                    <Label className="text-xs text-muted-foreground">Precio ($)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                        onKeyDown={handleItemKeyDown}
                                        className="bg-background no-spinner"
                                    />
                                </div>
                                <Button onClick={addGlobalItem} size="icon" className="mb-[2px]">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Items List */}
                            <div className="space-y-2 pt-2">
                                {globalItems.length === 0 ? (
                                    <span className="text-sm text-muted-foreground italic">Agrega items para comenzar.</span>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {globalItems.map((item, idx) => (
                                            <div key={item.id || idx} className="flex items-center gap-2 bg-background border border-border p-3 rounded-lg group">
                                                <div className="flex-grow">
                                                    <Input
                                                        value={item.name}
                                                        onChange={(e) => updateItem(idx, { name: e.target.value })}
                                                        className="h-8 border-transparent hover:border-border focus:border-primary px-2"
                                                    />
                                                </div>
                                                <div className="w-24 relative">
                                                    <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">$</span>
                                                    <Input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(idx, { price: Number(e.target.value) })}
                                                        className="h-8 border-transparent hover:border-border focus:border-primary pl-5 text-right font-mono text-sm no-spinner"
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(item.id)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Allocation per Package */}
                        <div className="space-y-4 pt-4 border-t border-border/40">
                            <Label className="text-sm font-semibold">Asignación de Costos por Paquete</Label>

                            {options.length === 0 ? (
                                <div className="p-4 border border-dashed border-border rounded-lg text-center text-muted-foreground text-sm">
                                    No hay opciones configuradas. Ve al módulo "Opciones" para crear paquetes primero.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {options.map((opt: any) => {
                                        const total = calculateTotal(opt.id);
                                        const assigned = allocations[opt.id] || [];

                                        return (
                                            <div key={opt.id} className="bg-background/50 border border-border/60 rounded-xl p-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-semibold text-foreground">{opt.title}</h4>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">{opt.advantage}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Costo Total</span>
                                                        <div className="text-xl font-bold font-mono text-foreground">${total.toLocaleString()}</div>
                                                    </div>
                                                </div>

                                                {globalItems.length === 0 ? (
                                                    <p className="text-xs text-muted-foreground italic">Define items arriba para asignarlos.</p>
                                                ) : (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {globalItems.map((item) => {
                                                            const isChecked = assigned.includes(item.id);
                                                            return (
                                                                <label
                                                                    key={item.id}
                                                                    className={cn(
                                                                        "flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all text-sm",
                                                                        isChecked
                                                                            ? "bg-primary/5 border-primary/30"
                                                                            : "border-border/40 hover:bg-muted"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5",
                                                                        isChecked ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background"
                                                                    )}>
                                                                        {isChecked && <Check className="w-3 h-3" />}
                                                                    </div>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="hidden"
                                                                        checked={isChecked}
                                                                        onChange={() => toggleItemAllocation(opt.id, item.id)}
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className={cn("block truncate", isChecked ? "font-medium text-foreground" : "text-muted-foreground")}>
                                                                            {item.name}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground font-mono">${item.price}</span>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* --- Document Details --- */}
            <div className="bg-card/40 p-6 rounded-xl border border-border/60 space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Detalles del Documento
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ValidatedInput
                        label="Título del Documento"
                        value={data.title || ''}
                        onChange={(v) => handleUpdate({ title: v })}
                        placeholder="Ej: Gerhard Rodriguez"
                    />
                    <ValidatedInput
                        label="Validez"
                        value={data.validUntil || ''}
                        onChange={(v) => handleUpdate({ validUntil: v })}
                        placeholder="Ej: Válido por 15 días"
                    />
                    <ValidatedInput
                        label="Ubicación del Cliente"
                        value={data.clientLocation || ''}
                        onChange={(v) => handleUpdate({ clientLocation: v })}
                        placeholder="Ej: USA"
                    />
                    <ValidatedInput
                        label="Tipo de Negocio / Industria"
                        value={data.clientType || ''}
                        onChange={(v) => handleUpdate({ clientType: v })}
                        placeholder="Ej: Servicios Profesionales"
                    />
                </div>
            </div>
        </div>
    );
}
