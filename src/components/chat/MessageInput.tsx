import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MentionSuggestions } from './MentionSuggestions';

interface MessageInputProps {
    onSend: (text: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [mentionTrigger, setMentionTrigger] = useState<'@' | '#' | '!' | null>(null);
    const [mentionQuery, setMentionQuery] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (!message.trim()) return;
        onSend(message);
        setMessage('');
        setMentionTrigger(null);
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setMessage(val);

        // Auto-resize
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }

        // Mention Detection Logic
        const cancelMention = () => {
            setMentionTrigger(null);
            setMentionQuery('');
        };

        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = val.slice(0, cursorPosition);
        const words = textBeforeCursor.split(/\s/);
        const lastWord = words[words.length - 1];

        if (lastWord.startsWith('@')) {
            setMentionTrigger('@');
            setMentionQuery(lastWord.slice(1));
        } else if (lastWord.startsWith('#')) {
            setMentionTrigger('#');
            setMentionQuery(lastWord.slice(1));
        } else if (lastWord.startsWith('!')) {
            setMentionTrigger('!');
            setMentionQuery(lastWord.slice(1));
        } else {
            cancelMention();
        }
    };

    const handleMentionSelect = (value: string) => {
        if (!mentionTrigger) return;

        const cursorPosition = textareaRef.current?.selectionStart || message.length;
        const textBeforeCursor = message.slice(0, cursorPosition);
        const textAfterCursor = message.slice(cursorPosition);

        const words = textBeforeCursor.split(/\s/);
        const lastWordIndex = textBeforeCursor.lastIndexOf(words[words.length - 1]);

        const newTextBefore = textBeforeCursor.substring(0, lastWordIndex);
        // We replace the trigger+query with the selected value + space
        const newValue = newTextBefore + value + ' ' + textAfterCursor;

        setMessage(newValue);
        setMentionTrigger(null);
        setMentionQuery('');

        // Refocus and set cursor
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                // Cursor logic roughly
            }
        }, 10);
    };

    const insertTrigger = (char: string) => {
        setMessage(prev => prev + char);
        setMentionTrigger(char as any);
        setMentionQuery('');
        textareaRef.current?.focus();
    };

    return (
        <div className="p-3 bg-background border-t border-border relative">
            {mentionTrigger && (
                <MentionSuggestions
                    trigger={mentionTrigger}
                    query={mentionQuery}
                    onSelect={handleMentionSelect}
                />
            )}

            <div className="flex items-end gap-2 bg-muted/30 border border-border rounded-2xl p-2 transition-all focus-within:ring-1 focus-within:ring-primary/50">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-foreground shrink-0 rounded-xl"
                    disabled
                    title="Próximamente: Adjuntar archivos"
                >
                    <Paperclip className="w-5 h-5" />
                </Button>

                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-base min-h-[40px] max-h-[120px] py-2 resize-none scrollbar-thin scrollbar-thumb-muted-foreground/20"
                    rows={1}
                />

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-foreground shrink-0 rounded-xl"
                    >
                        <Smile className="w-5 h-5" />
                    </Button>
                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        style={{
                            backgroundColor: message.trim() ? '#000000' : '#f3f4f6',
                            color: message.trim() ? '#ffffff' : '#9ca3af'
                        }}
                        className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50",
                            message.trim()
                                ? "shadow-sm hover:opacity-90"
                                : "cursor-not-allowed"
                        )}
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </div>
            </div>

            <div className="flex gap-3 mt-2 px-2 text-[10px] text-muted-foreground font-medium select-none">
                <span onClick={() => insertTrigger('@')} className="hover:text-primary cursor-pointer transition-colors flex items-center gap-1">
                    <kbd className="bg-muted px-1 rounded border border-border text-[9px]">@</kbd> Mencionar
                </span>
                <span onClick={() => insertTrigger('#')} className="hover:text-primary cursor-pointer transition-colors flex items-center gap-1">
                    <kbd className="bg-muted px-1 rounded border border-border text-[9px]">#</kbd> Proyecto
                </span>
                <span onClick={() => insertTrigger('!')} className="hover:text-primary cursor-pointer transition-colors flex items-center gap-1">
                    <kbd className="bg-muted px-1 rounded border border-border text-[9px]">!</kbd> Tarea
                </span>
            </div>
        </div>
    );
}
