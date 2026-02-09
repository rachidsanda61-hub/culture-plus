'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationsContext';
import { useAuth } from './AuthContext';
import { getConversations, sendMessage as sendMessageAction, markMessagesAsRead } from '@/app/actions/messages';

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string | Date; // ISO string from DB
    read: boolean;
}

export interface Conversation {
    partnerId: string;
    messages: Message[];
}

interface MessagesContextType {
    conversations: Conversation[];
    sendMessage: (receiverId: string, content: string) => Promise<void>;
    markAsRead: (partnerId: string) => Promise<void>;
    unreadCount: number;
    getConversation: (partnerId: string) => Conversation | undefined;
    isLoading: boolean;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth() || {};
    const { addNotification } = useNotifications();

    const loadConversations = async () => {
        if (!user || !user.id) return;
        try {
            const data = await getConversations(user.id);
            setConversations(data as Conversation[]);
        } catch (error) {
            console.error('Failed to load conversations', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.id) {
            loadConversations();
            const interval = setInterval(loadConversations, 10000);
            return () => clearInterval(interval);
        } else {
            setConversations([]);
            setIsLoading(false);
        }
    }, [user?.id]);

    const sendMessage = async (receiverId: string, content: string) => {
        if (!user || !user.id) return;
        try {
            const optimisticMsg: Message = {
                id: `temp-${Date.now()}`,
                senderId: user.id,
                receiverId,
                content,
                createdAt: new Date().toISOString(),
                read: true
            };

            setConversations(prev => {
                const existing = prev.find(c => c.partnerId === receiverId);
                if (existing) {
                    return prev.map(c => c.partnerId === receiverId ?
                        { ...c, messages: [...c.messages, optimisticMsg] } : c
                    );
                } else {
                    return [...prev, { partnerId: receiverId, messages: [optimisticMsg] }];
                }
            });

            await sendMessageAction(user.id, receiverId, content);
            loadConversations();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const markAsRead = async (partnerId: string) => {
        if (!user || !user.id) return;
        try {
            await markMessagesAsRead(user.id, partnerId);
            setConversations(prev => prev.map(c => {
                if (c.partnerId === partnerId) {
                    return {
                        ...c,
                        messages: c.messages.map(m => m.senderId === partnerId ? { ...m, read: true } : m)
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getConversation = (partnerId: string) => conversations.find(c => c.partnerId === partnerId);

    const unreadCount = conversations.reduce((acc, conv) => {
        const messages = conv.messages || [];
        const unreadInConv = messages.filter(m => m.senderId === conv.partnerId && !m.read).length;
        return acc + unreadInConv;
    }, 0);

    return (
        <MessagesContext.Provider value={{ conversations, sendMessage, markAsRead, unreadCount, getConversation, isLoading }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessagesContext);
    if (context === undefined) {
        return {
            conversations: [],
            sendMessage: async () => { },
            markAsRead: async () => { },
            unreadCount: 0,
            getConversation: () => undefined,
            isLoading: false
        };
    }
    return context;
};
