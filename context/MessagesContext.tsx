'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useNotifications } from './NotificationsContext';
import { useAuth } from './AuthContext';
import { getConversations, getConversationMessages, sendMessage as sendMessageAction, markAsSeen, getOrCreateConversation, setTypingStatus } from '@/app/actions/messages';

export interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: string | Date;
    isSeen: boolean;
}

export interface ConversationListType {
    id: string;
    partnerId: string;
    partnerName: string;
    partnerImage: string | null;
    partnerLastTypedAt: Date | null;
    lastMessage: Message | null;
    unreadCount: number;
}

interface MessagesContextType {
    conversations: ConversationListType[];
    activeConversationId: string | null;
    setActiveConversationId: (id: string | null) => void;
    activeMessages: Message[];
    sendMessage: (content: string) => Promise<void>;
    startConversation: (partnerId: string) => Promise<string | undefined>;
    markAsRead: () => Promise<void>;
    updateTyping: (isTyping: boolean) => void;
    unreadCount: number;
    isLoading: boolean;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
    const [conversations, setConversations] = useState<ConversationListType[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [activeMessages, setActiveMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth() || {};
    const { addNotification } = useNotifications();

    const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const loadConversations = async (background = false) => {
        if (!user || !user.id) return;
        try {
            const data = await getConversations(user.id);
            setConversations(data as any);
        } catch (error) {
            console.error('Failed to load conversations', error);
        } finally {
            if (!background) setIsLoading(false);
        }
    };

    const loadActiveMessages = async () => {
        if (!user || !user.id || !activeConversationId) return;
        try {
            const messages = await getConversationMessages(activeConversationId, user.id);
            // check for unread to mark as read
            const hasUnread = messages.some((m: any) => m.senderId !== user.id && m.isSeen === false);

            setActiveMessages(messages as any);

            if (hasUnread) {
                markAsRead();
                loadConversations(true); // reload side panel count
            }
        } catch (error) {
            console.error('Failed to load active messages', error);
        }
    };

    useEffect(() => {
        if (user && user.id) {
            loadConversations();

            // Fast polling for near real-time updates (1 second)
            fetchIntervalRef.current = setInterval(() => {
                loadConversations(true);
            }, 1000);

            return () => {
                if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
            };
        } else {
            setConversations([]);
            setActiveMessages([]);
            setIsLoading(false);
        }
    }, [user?.id]);

    // Separate effect for polling active messages so it registers the activeConversationId immediately without full component reboot
    useEffect(() => {
        if (!activeConversationId) return;

        loadActiveMessages(); // initial load

        const msgInterval = setInterval(() => {
            loadActiveMessages();
        }, 1000);

        return () => clearInterval(msgInterval);
    }, [activeConversationId]);

    const sendMessage = async (content: string) => {
        if (!user || !user.id || !activeConversationId) return;
        try {
            const optimisticMsg: Message = {
                id: `temp-${Date.now()}`,
                senderId: user.id,
                content,
                createdAt: new Date(),
                isSeen: false
            };

            setActiveMessages(prev => [...prev, optimisticMsg]);

            setConversations(prev => prev.map(c =>
                c.id === activeConversationId
                    ? { ...c, lastMessage: optimisticMsg }
                    : c
            ));

            await sendMessageAction(activeConversationId, user.id, content);
            loadActiveMessages();
            loadConversations(true);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const startConversation = async (partnerId: string) => {
        if (!user || !user.id) return;
        try {
            setIsLoading(true);
            const convId = await getOrCreateConversation(user.id, partnerId);
            setActiveConversationId(convId);
            window.history.pushState(null, '', `/messages?with=${partnerId}&conv=${convId}`);
            setIsLoading(false);
            return convId;
        } catch (e) {
            console.error("Failed to start conv", e);
            setIsLoading(false);
        }
    };

    const markAsRead = async () => {
        if (!user || !user.id || !activeConversationId) return;
        try {
            await markAsSeen(activeConversationId, user.id);
            setConversations(prev => prev.map(c =>
                c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const updateTyping = async (isTyping: boolean) => {
        if (!user || !user.id || !activeConversationId) return;
        try {
            await setTypingStatus(activeConversationId, user.id, isTyping);
        } catch (error) {
            console.error('Failed to set typing status', error);
        }
    };

    const unreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

    return (
        <MessagesContext.Provider value={{ conversations, activeConversationId, setActiveConversationId, activeMessages, sendMessage, startConversation, markAsRead, updateTyping, unreadCount, isLoading }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessagesContext);
    if (context === undefined) {
        return {
            conversations: [],
            activeConversationId: null,
            setActiveConversationId: () => { },
            activeMessages: [],
            sendMessage: async () => { },
            startConversation: async () => undefined,
            markAsRead: async () => { },
            updateTyping: () => { },
            unreadCount: 0,
            isLoading: false
        };
    }
    return context;
};
