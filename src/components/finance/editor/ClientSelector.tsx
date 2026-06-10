import { useState } from 'react';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import type { Client } from '@/types/crm';
import { useFormContext } from 'react-hook-form';
import { ClientDialog } from '@/components/crm/ClientDialog';

interface ClientSelectorProps {
    clients: Client[];
    onClientCreated?: (newClient: Client) => void;
}

export function ClientSelector({ clients, onClientCreated }: ClientSelectorProps) {
    const { setValue, watch } = useFormContext();
    const [open, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const selectedClientId = watch('clientId');
    const selectedClient = clients.find((c) => c.id === selectedClientId);

    const handleSelect = (clientId: string) => {
        setValue('clientId', clientId);
        setOpen(false);
    };

    return (
        <div className="w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-background"
                    >
                        {selectedClient ? selectedClient.name : "Seleccionar cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar cliente..." />
                        <CommandList>
                            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                            <CommandGroup heading="Acciones">
                                <CommandItem onSelect={() => {
                                    setOpen(false);
                                    setDialogOpen(true);
                                }} className="cursor-pointer text-primary font-medium">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Crear Nuevo Cliente
                                </CommandItem>
                            </CommandGroup>
                            <CommandGroup heading="Clientes">
                                {clients.map((client) => (
                                    <CommandItem
                                        key={client.id}
                                        value={client.name} // Search by name
                                        onSelect={() => handleSelect(client.id)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedClientId === client.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{client.name}</span>
                                            {client.commercialName && (
                                                <span className="text-xs text-muted-foreground">
                                                    {client.commercialName}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <ClientDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={(newClient) => {
                    if (newClient) {
                        if (onClientCreated) onClientCreated(newClient);
                        setValue('clientId', newClient.id);
                    }
                    setDialogOpen(false);
                }}
            />
        </div>
    );
}
