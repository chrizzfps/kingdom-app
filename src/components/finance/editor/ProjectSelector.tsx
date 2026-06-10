import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, FolderKanban } from 'lucide-react';
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
import type { Project } from '@/types/crm';
import { useFormContext } from 'react-hook-form';
import { getProjects } from '@/api/crm';

interface ProjectSelectorProps {
    clientId?: string;
}

export function ProjectSelector({ clientId }: ProjectSelectorProps) {
    const { setValue, watch } = useFormContext();
    const [open, setOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    const selectedProjectId = watch('projectId');
    const selectedProject = projects.find((p) => p.id === selectedProjectId);

    // Fetch projects when clientId changes
    useEffect(() => {
        if (!clientId) {
            setProjects([]);
            setValue('projectId', undefined);
            return;
        }

        setLoading(true);
        getProjects(clientId)
            .then((data) => setProjects(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [clientId, setValue]);

    const handleSelect = (projectId: string) => {
        setValue('projectId', projectId);
        setOpen(false);
    };

    const handleClear = () => {
        setValue('projectId', undefined);
        setOpen(false);
    };

    if (!clientId) {
        return (
            <Button variant="outline" disabled className="w-full justify-start text-muted-foreground">
                <FolderKanban className="mr-2 h-4 w-4" />
                Selecciona un cliente primero
            </Button>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-background"
                    disabled={loading}
                >
                    {loading ? (
                        "Cargando proyectos..."
                    ) : selectedProject ? (
                        <span className="flex items-center gap-2">
                            <FolderKanban className="h-4 w-4" />
                            {selectedProject.name}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Proyecto (opcional)</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 bg-popover" align="start">
                <Command>
                    <CommandInput placeholder="Buscar proyecto..." />
                    <CommandList>
                        <CommandEmpty>No se encontraron proyectos para este cliente.</CommandEmpty>
                        <CommandGroup>
                            {selectedProjectId && (
                                <CommandItem onSelect={handleClear} className="text-muted-foreground">
                                    Limpiar selección
                                </CommandItem>
                            )}
                            {projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={project.name}
                                    onSelect={() => handleSelect(project.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedProjectId === project.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{project.name}</span>
                                        {project.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {project.description}
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
    );
}
