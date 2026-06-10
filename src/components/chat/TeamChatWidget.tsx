import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Minimize2, ChevronLeft, Hash } from 'lucide-react';
import { useChat } from './ChatContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { ChannelList } from './ChannelList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useClients } from '@/hooks/useClients';

import { useLocation } from 'react-router-dom';

export function TeamChatWidget() {
    const { isOpen, toggleChat, activeChannel, sendMessage } = useChat();
    const [view, setView] = useState<'chat' | 'channels'>('chat');
    const { clients } = useClients();
    const location = useLocation();

    // Hide chat on restricted public paths
    if (location.pathname.startsWith('/p/') || location.pathname.startsWith('/preview/')) {
        return null;
    }

    const toggleOpen = () => toggleChat();

    const handleChannelSelect = () => {
        setView('chat');
    };

    const channelName = useMemo(() => {
        if (activeChannel === 'general') return 'General';
        if (activeChannel === 'announcements') return 'Anuncios';
        const client = clients.find(c => c.id === activeChannel);
        return client ? client.name : 'Desconocido';
    }, [activeChannel, clients]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-muted/30 shrink-0">
                            <div className="flex items-center gap-2">
                                {view === 'chat' ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 -ml-2 text-muted-foreground hover:bg-muted/50"
                                            onClick={() => setView('channels')}
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </Button>
                                        <div onClick={() => setView('channels')} className="cursor-pointer hover:opacity-80 transition-opacity">
                                            <h3 className="font-bold text-base flex items-center gap-2">
                                                <Hash className="w-5 h-5 text-primary" />
                                                <span className="truncate max-w-[200px]">{channelName}</span>
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
                                                En línea
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <h3 className="font-bold text-base ml-1">Canales</h3>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl">
                                    <Minimize2 className="w-5 h-5" onClick={toggleOpen} />
                                </Button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            {view === 'channels' ? (
                                <ChannelList onSelect={handleChannelSelect} />
                            ) : (
                                <>
                                    <MessageList />
                                    <MessageInput onSend={(text) => sendMessage(text)} />
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleOpen}
                className={cn(
                    "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
                    isOpen
                        ? "bg-muted text-muted-foreground hover:bg-muted/80 rotate-90"
                        : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>
        </div>
    );
}
