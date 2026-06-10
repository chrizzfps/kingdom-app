import { useState, type KeyboardEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, X } from 'lucide-react';
import type { ProposalModule } from '@/types/proposal';
import { HelpPanel } from '@/components/admin/HelpPanel';

interface EditorProps {
    module: ProposalModule;
    onUpdate: (data: any) => void;
}

interface Option {
    id: string;
    title: string;
    description: string;
    advantage: string;
    coreServices: string[];
    badge?: string;
    isPopular?: boolean;
}

export function OptionsEditor({ module, onUpdate }: EditorProps) {
    const data = module.data || {};
    const options: Option[] = data.options || [];

    // State for new core service input per option
    const [newServiceInputs, setNewServiceInputs] = useState<Record<string, string>>({});

    // --- Option Management ---
    const handleOptionChange = (index: number, updates: Partial<Option>) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], ...updates };
        onUpdate({ options: newOptions });
    };

    const addOption = () => {
        const newOption: Option = {
            id: crypto.randomUUID(),
            title: 'Nueva Opción',
            description: 'Descripción comercial persuasiva...',
            advantage: 'Ventaja competitiva principal.',
            coreServices: [],
            badge: ''
        };
        onUpdate({ options: [...options, newOption] });
    };

    const removeOption = (index: number) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        onUpdate({ options: newOptions });
    };

    // --- Core Services Management ---
    const addCoreService = (optIndex: number) => {
        const input = newServiceInputs[optIndex]?.trim();
        if (!input) return;

        const option = options[optIndex];
        const updatedServices = [...(option.coreServices || []), input];
        handleOptionChange(optIndex, { coreServices: updatedServices });
        setNewServiceInputs(prev => ({ ...prev, [optIndex]: '' }));
    };

    const removeCoreService = (optIndex: number, serviceIndex: number) => {
        const option = options[optIndex];
        const updatedServices = [...(option.coreServices || [])];
        updatedServices.splice(serviceIndex, 1);
        handleOptionChange(optIndex, { coreServices: updatedServices });
    };

    const handleServiceKeyDown = (e: KeyboardEvent<HTMLInputElement>, optIndex: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCoreService(optIndex);
        }
    };

    return (
        <div className="space-y-8">
            <HelpPanel title="Configuración de Paquetes (Opciones)">
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Título y Descripción:</strong> Define el nombre y una descripción comercial persuasiva.</li>
                    <li><strong>Ventaja Competitiva:</strong> Destaca el principal beneficio de elegir esta opción.</li>
                    <li><strong>Core Services:</strong> Lista de beneficios clave en lenguaje amigable (NO precios).</li>
                    <li className="text-muted-foreground">Nota: Los precios y asignación de ítems se configuran en el módulo "Cotización".</li>
                </ul>
            </HelpPanel>

            <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Paquetes Disponibles</Label>
                <Button onClick={addOption} size="sm" variant="outline" className="border-dashed border-primary/40 text-primary hover:bg-primary/5">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Paquete
                </Button>
            </div>

            <div className="space-y-6">
                {options.map((opt, optIndex) => (
                    <div key={opt.id || optIndex} className="p-6 border rounded-xl bg-card/20 border-border/60 hover:bg-card/40 transition-colors relative">

                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Opción {optIndex + 1}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeOption(optIndex)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Title & Advantage Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <Label className="text-sm">Título de la Opción</Label>
                                <Input
                                    value={opt.title}
                                    onChange={(e) => handleOptionChange(optIndex, { title: e.target.value })}
                                    placeholder="Ej. Portafolio Profesional en WordPress"
                                    className="bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Ventaja Competitiva</Label>
                                <Input
                                    value={opt.advantage || ''}
                                    onChange={(e) => handleOptionChange(optIndex, { advantage: e.target.value })}
                                    placeholder="Ideal si buscas velocidad de implementación..."
                                    className="bg-background"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 mb-6">
                            <Label className="text-sm">Descripción Comercial</Label>
                            <Textarea
                                value={opt.description}
                                onChange={(e) => handleOptionChange(optIndex, { description: e.target.value })}
                                placeholder="Solución eficiente montada sobre CMS robusto (WordPress o Framer) enfocada en la limpieza visual y la funcionalidad."
                                className="bg-background min-h-[80px] resize-none"
                            />
                        </div>

                        {/* Core Services */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Core Services (Lista de Beneficios)</Label>

                            {/* Input for new service */}
                            <div className="flex gap-2">
                                <Input
                                    value={newServiceInputs[optIndex] || ''}
                                    onChange={(e) => setNewServiceInputs(prev => ({ ...prev, [optIndex]: e.target.value }))}
                                    onKeyDown={(e) => handleServiceKeyDown(e, optIndex)}
                                    placeholder="Ej. Diseño UI/UX Minimalista"
                                    className="bg-background flex-1"
                                />
                                <span className="text-xs text-muted-foreground self-center whitespace-nowrap">
                                    Presiona Enter para añadir
                                </span>
                            </div>

                            {/* Service Tags */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {(opt.coreServices || []).map((service, sIdx) => (
                                    <div
                                        key={sIdx}
                                        className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-full text-sm group hover:border-destructive/50 transition-colors"
                                    >
                                        <span>{service}</span>
                                        <button
                                            onClick={() => removeCoreService(optIndex, sIdx)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {(opt.coreServices || []).length === 0 && (
                                    <span className="text-xs text-muted-foreground italic">
                                        Añade beneficios clave para esta opción...
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Highlight Option */}
                        <div className="mt-6 pt-4 border-t border-border/40">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="highlightedOption"
                                    checked={!!opt.isPopular}
                                    onChange={() => {
                                        const newOpts = options.map((o, i) => ({
                                            ...o,
                                            isPopular: i === optIndex
                                        }));
                                        onUpdate({ options: newOpts });
                                    }}
                                    className="w-4 h-4 text-brand-blue focus:ring-brand-blue accent-brand-blue"
                                />
                                <div>
                                    <span className="text-sm font-medium text-foreground group-hover:text-brand-blue transition-colors">
                                        Destacar en Cotización
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        Esta opción se resaltará visualmente en la vista pública.
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>
                ))}

                {options.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground mb-4">No hay paquetes configurados</p>
                        <Button onClick={addOption} variant="outline">
                            <Plus className="mr-2 h-4 w-4" /> Crear Primer Paquete
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
