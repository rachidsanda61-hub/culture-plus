
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
    id: string;
    senderId: string; // 'me' ou profileId
    receiverId: string;
    content: string;
    date: string; // ISO string or timestamp
    read: boolean;
}

export interface Conversation {
    partnerId: string; // L'ID de l'autre personne (ex: 'amina-kader')
    messages: Message[];
}

interface MessagesContextType {
    conversations: Conversation[];
    sendMessage: (receiverId: string, content: string) => void;
    markAsRead: (partnerId: string) => void;
    unreadCount: number;
    getConversation: (partnerId: string) => Conversation | undefined;
}

const initialConversations: Conversation[] = [
    {
        partnerId: 'amina-kader',
        messages: [
            { id: 'm1', senderId: 'amina-kader', receiverId: 'me', content: 'Bonjour ! Merci pour votre abonnement.', date: new Date(Date.now() - 86400000).toISOString(), read: true },
            { id: 'm2', senderId: 'me', receiverId: 'amina-kader', content: 'Vos toiles sont magnifiques ! Avez-vous une galerie ?', date: new Date(Date.now() - 80000000).toISOString(), read: true },
            { id: 'm3', senderId: 'amina-kader', receiverId: 'me', content: 'Oui, je suis exposée au Musée National en ce moment.', date: new Date(Date.now() - 3600000).toISOString(), read: false }
        ]
    }
];

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);

    const sendMessage = (receiverId: string, content: string) => {
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: 'me',
            receiverId,
            content,
            date: new Date().toISOString(),
            read: true
        };

        setConversations(prev => {
            const existingConvIndex = prev.findIndex(c => c.partnerId === receiverId);
            if (existingConvIndex >= 0) {
                const newConvs = [...prev];
                newConvs[existingConvIndex] = {
                    ...newConvs[existingConvIndex],
                    messages: [...newConvs[existingConvIndex].messages, newMessage]
                };
                return newConvs; // Move to top logic could be added here
            } else {
                return [...prev, { partnerId: receiverId, messages: [newMessage] }];
            }
        });
    };

    const markAsRead = (partnerId: string) => {
        setConversations(prev => prev.map(c => {
            if (c.partnerId === partnerId) {
                return {
                    ...c,
                    messages: c.messages.map(m => m.senderId === partnerId ? { ...m, read: true } : m)
                };
            }
            return c;
        }));
    };

    const getConversation = (partnerId: string) => conversations.find(c => c.partnerId === partnerId);

    const unreadCount = conversations.reduce((acc, conv) => {
        const unreadInConv = conv.messages.filter(m => m.senderId === conv.partnerId && !m.read).length;
        return acc + unreadInConv;
    }, 0);

    return (
        <MessagesContext.Provider value={{ conversations, sendMessage, markAsRead, unreadCount, getConversation }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessagesContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessagesProvider');
    }
    return context;
};
