import { Hash, Users, Crown, Search, Loader2 } from 'lucide-react';
import { useChat } from './ChatContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useClients } from '@/hooks/useClients';

export function ChannelList({ onSelect }: { onSelect?: () => void }) {
    const { activeChannel, setActiveChannel } = useChat();
    const { clients, isLoading } = useClients();
    const [search, setSearch] = useState('');

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (id: string) => {
        setActiveChannel(id);
        if (onSelect) onSelect();
    };

    return (
        <div className="flex flex-col h-full bg-muted/10">
            <div className="p-3 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar canal..."
                        className="pl-9 h-10 text-sm bg-background border-border/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 p-3">
                <div className="mb-6">
                    <p className="px-3 text-[11px] font-bold text-muted-foreground mb-3 uppercase tracking-widest opacity-70">General</p>
                    <button
                        onClick={() => handleSelect('general')}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all mb-1",
                            activeChannel === 'general'
                                ? "bg-primary/10 text-primary font-bold shadow-sm"
                                : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Hash className="w-5 h-5" />
                        General
                    </button>
                    <button
                        onClick={() => handleSelect('announcements')}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all",
                            activeChannel === 'announcements'
                                ? "bg-primary/10 text-primary font-bold shadow-sm"
                                : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Users className="w-5 h-5" />
                        Anuncios
                    </button>
                </div>

                <div>
                    <p className="px-3 text-[11px] font-bold text-muted-foreground mb-3 uppercase tracking-widest opacity-70">Clientes</p>
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <p className="px-3 text-sm text-muted-foreground italic">No se encontraron clientes</p>
                    ) : (
                        filteredClients.map(client => (
                            <button
                                key={client.id}
                                onClick={() => handleSelect(client.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all mb-1",
                                    activeChannel === client.id
                                        ? "bg-primary/10 text-primary font-bold shadow-sm"
                                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Crown className="w-5 h-5 shrink-0 opacity-70" />
                                    <span className="truncate">{client.name}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
