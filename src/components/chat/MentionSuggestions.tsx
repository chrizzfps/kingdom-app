import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUsers } from '@/hooks/useUsers';
import { useProjects } from '@/hooks/useProjects';
import { useAllTasks } from '@/hooks/useAllTasks';
import { Loader2, Hash, CheckSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MentionSuggestionsProps {
    trigger: '@' | '#' | '!';
    query: string;
    onSelect: (value: string) => void;
}

export function MentionSuggestions({ trigger, query, onSelect }: MentionSuggestionsProps) {
    const { users, isLoading: loadingUsers } = useUsers();
    const { projects, isLoading: loadingProjects } = useProjects();
    const { tasks, isLoading: loadingTasks } = useAllTasks();

    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const lowerQuery = query.toLowerCase();
        let items: any[] = [];
        setIsLoading(true);

        if (trigger === '@') {
            items = users.filter(u =>
                (u.displayName || u.name || '').toLowerCase().includes(lowerQuery)
            ).map(u => ({
                id: u.id,
                label: u.displayName || u.name,
                subLabel: u.email,
                avatar: u.avatar_url,
                type: 'user'
            }));
            setIsLoading(loadingUsers);
        } else if (trigger === '#') {
            items = projects.filter(p =>
                p.name.toLowerCase().includes(lowerQuery)
            ).map(p => ({
                id: p.id,
                label: p.name,
                subLabel: p.status, // Assuming status exists
                type: 'project'
            }));
            setIsLoading(loadingProjects);
        } else if (trigger === '!') {
            items = tasks.filter(t =>
                t.title.toLowerCase().includes(lowerQuery)
            ).map(t => ({
                id: t.id,
                label: t.title,
                subLabel: t.projectName,
                type: 'task'
            }));
            setIsLoading(loadingTasks);
        }

        setFilteredItems(items.slice(0, 5)); // Limit to 5 results
        if (!loadingUsers && !loadingProjects && !loadingTasks) setIsLoading(false);

    }, [trigger, query, users, projects, tasks, loadingUsers, loadingProjects, loadingTasks]);

    if (isLoading) {
        return (
            <div className="absolute bottom-full left-4 mb-2 w-64 bg-popover border border-border rounded-lg shadow-lg p-2 z-50">
                <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    Buscando...
                </div>
            </div>
        );
    }

    if (filteredItems.length === 0) return null;

    return (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50">
            <div className="bg-muted/50 px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase border-b border-border">
                {trigger === '@' ? 'Usuarios' : trigger === '#' ? 'Proyectos' : 'Tareas'}
            </div>
            <ScrollArea className="max-h-[200px]">
                <div className="p-1">
                    {filteredItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                // Use non-breaking space to keep the mention as a single "word" for the parser
                                onSelect(`${trigger}${item.label.replace(/ /g, '\u00A0')}`);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                            {trigger === '@' ? (
                                <Avatar className="w-6 h-6">
                                    <AvatarImage src={item.avatar} />
                                    <AvatarFallback>{item.label?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            ) : trigger === '#' ? (
                                <div className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-md">
                                    <Hash className="w-4 h-4" />
                                </div>
                            ) : (
                                <div className="w-6 h-6 flex items-center justify-center bg-orange-500/10 text-orange-500 rounded-md">
                                    <CheckSquare className="w-4 h-4" />
                                </div>
                            )}

                            <div className="flex-1 overflow-hidden">
                                <p className="font-medium truncate">{item.label}</p>
                                {item.subLabel && <p className="text-[10px] text-muted-foreground truncate">{item.subLabel}</p>}
                            </div>
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
