import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useChat } from './ChatContext';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useAllTasks } from '@/hooks/useAllTasks';
import { useUsers } from '@/hooks/useUsers';


export function MessageList() {
    const { messages, currentUser, deleteMessage } = useChat();
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch data for lookup (we need to match names back to IDs)
    const { projects } = useProjects();
    const { tasks } = useAllTasks();
    const { users } = useUsers();

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '...';
        // Handle Firestore Timestamp or Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessageContent = (content: string, isMe: boolean) => {
        // Simple plain text parser (until we implement rich text metadata)
        return content.split(' ').map((word, i) => {
            // Mentions Styling (Single word approximation)
            if (word.startsWith('@') || word.startsWith('#') || word.startsWith('!')) {
                const trigger = word[0];
                // Replace non-breaking spaces back to normal spaces for lookup
                const label = word.substring(1).replace(/\u00A0/g, ' ');

                let bgColor = "";
                let foundId = "";

                if (trigger === '@') {
                    bgColor = isMe ? "bg-white/20 text-white dark:bg-black/10 dark:text-black" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
                    // Find user by name (approximate)
                    const user = users.find(u => (u.displayName || u.name) === label);
                    if (user) foundId = user.id;
                }
                if (trigger === '#') {
                    bgColor = isMe ? "bg-white/20 text-white dark:bg-black/10 dark:text-black" : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
                    // Find project by name
                    const project = projects.find(p => p.name === label);
                    if (project) foundId = project.id;
                }
                if (trigger === '!') {
                    bgColor = isMe ? "bg-white/20 text-white dark:bg-black/10 dark:text-black" : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
                    // Find task by title
                    const task = tasks.find(t => t.title === label);
                    if (task) foundId = task.id;
                }

                return (
                    <span
                        key={i}
                        onClick={() => {
                            if (!foundId) return;
                            if (trigger === '#') navigate(`/admin/projects/${foundId}`);
                            if (trigger === '!') navigate('/admin/tasks');
                        }}
                        className={cn(
                            "font-bold rounded px-1 py-0.5 mx-0.5 text-[11px] transition-colors inline-block",
                            bgColor,
                            foundId ? "cursor-pointer" : "cursor-default opacity-90"
                        )}
                        title={foundId ? `Ir a ${label}` : undefined}
                    >
                        {word.replace(/\u00A0/g, ' ')}
                    </span>
                );
            }

            // URL Styling
            if (word.startsWith('http')) {
                return (
                    <a key={i} href={word} target="_blank" rel="noopener noreferrer" className="underline opacity-90 hover:opacity-100">
                        {word}{' '}
                    </a>
                );
            }

            return <span key={i}>{word} </span>;
        });
    };

    return (
        <ScrollArea className="flex-1 p-4 bg-muted/5">
            <div className="space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-10 opacity-50">
                        No hay mensajes aún. ¡Di hola! 👋
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = currentUser && msg.senderId === currentUser.uid;

                    const messageContent = (
                        <div className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                            <Avatar className="w-8 h-8 mt-1 border border-transparent shrink-0">
                                {isMe ? (
                                    <div className="flex h-full w-full items-center justify-center rounded-full !bg-black !text-white dark:!bg-white dark:!text-black text-xs font-bold transition-colors border border-border/10">
                                        {currentUser?.displayName?.substring(0, 2).toUpperCase() || 'YO'}
                                    </div>
                                ) : (
                                    <>
                                        {msg.senderAvatar && <AvatarImage src={msg.senderAvatar} />}
                                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                            {msg.senderName?.substring(0, 2).toUpperCase() || '??'}
                                        </AvatarFallback>
                                    </>
                                )}
                            </Avatar>

                            <div
                                className={cn(
                                    "max-w-[80%] text-[13px] leading-relaxed rounded-2xl p-3 shadow-sm relative transition-colors",
                                    isMe
                                        ? "!bg-black !text-white dark:!bg-white dark:!text-black rounded-tr-none ml-auto"
                                        : "bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-tl-none text-foreground mr-auto"
                                )}>
                                {!isMe && <p className="font-bold text-[10px] mb-1 opacity-70 text-primary">{msg.senderName}</p>}
                                <p className="whitespace-pre-wrap break-words">
                                    {renderMessageContent(msg.content, isMe)}
                                </p>
                                <p className={cn(
                                    "text-[9px] mt-1 text-right transition-opacity",
                                    isMe ? "opacity-70 dark:opacity-60" : "opacity-40"
                                )}>
                                    {formatTime(msg.createdAt)}
                                </p>
                            </div>
                        </div>
                    );

                    // Wrap with ContextMenu only for own messages
                    if (isMe) {
                        return (
                            <ContextMenu key={msg.id}>
                                <ContextMenuTrigger asChild>
                                    {messageContent}
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-48">
                                    <ContextMenuItem
                                        onClick={() => deleteMessage(msg.id)}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Eliminar mensaje
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        );
                    }

                    return <div key={msg.id}>{messageContent}</div>;
                })}
                <div ref={scrollRef} />
            </div>
        </ScrollArea>
    );
}
