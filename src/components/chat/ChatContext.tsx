import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    limit
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    createdAt: any;
    type: 'text' | 'image';
    mentions?: string[];
}

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    toggleChat: () => void;

    activeChannel: string;
    setActiveChannel: (channelId: string) => void;

    messages: Message[];
    sendMessage: (text: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;

    unreadCount: number;
    setUnreadCount: (count: number) => void;

    currentUser: any;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState('general');
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Load Messages
    useEffect(() => {
        if (!activeChannel || !currentUser) return;

        const collectionRef = collection(db, 'channels', activeChannel, 'messages');
        const q = query(
            collectionRef,
            orderBy('createdAt', 'asc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [activeChannel, currentUser]);

    const sendMessage = async (text: string) => {
        if (!currentUser || !text.trim()) return;

        try {
            await addDoc(collection(db, 'channels', activeChannel, 'messages'), {
                content: text,
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario',
                senderAvatar: currentUser.photoURL,
                createdAt: serverTimestamp(),
                type: 'text',
                mentions: [] // TODO: Parse mentions
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const deleteMessage = async (messageId: string) => {
        if (!currentUser || !messageId) return;
        try {
            await deleteDoc(doc(db, 'channels', activeChannel, 'messages', messageId));
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const toggleChat = () => setIsOpen(prev => !prev);

    return (
        <ChatContext.Provider value={{
            isOpen,
            setIsOpen,
            toggleChat,
            activeChannel,
            setActiveChannel,
            messages,
            sendMessage,
            deleteMessage,
            unreadCount,
            setUnreadCount,
            currentUser
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
