'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { getNotifications, markAsRead as markAsReadAction, markAllAsRead as markAllAsReadAction, deleteNotification } from '@/app/actions/notifications';

export interface AppNotification {
    id: string;
    type: 'event' | 'message' | 'post' | 'like' | 'follow' | 'comment' | 'review';
    title: string;
    message: string;
    link: string;
    read: boolean;
    date: Date;
    image?: string;
}

interface NotificationsContextType {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'date'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const router = useRouter();
    const { user } = useAuth(); // Import useAuth to get current user

    const loadNotifications = async () => {
        if (!user) return;
        try {
            const data = await getNotifications(user.id);
            setNotifications(data.map((n: any) => ({
                ...n,
                date: new Date(n.createdAt), // Convert to Date object
                link: n.link || '',
                type: n.type as any
            })));
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    };

    useEffect(() => {
        if (user) {
            loadNotifications();
            const interval = setInterval(loadNotifications, 10000); // Poll every 10s
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
        }
    }, [user?.id]);

    const addNotification = (notif: Omit<AppNotification, 'id' | 'read' | 'date'>) => {
        // Client-side only notification (e.g. for toasts or immediate feedback)
        // For persistent notifications, we rely on polling or server actions creating them
        // But we can keep this for optimistic UI or local alerts
    };

    const markAsRead = async (id: string) => {
        try {
            await markAsReadAction(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            await markAllAsReadAction(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const removeNotification = async (id: string) => {
        try {
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification }}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    // Silent fail for build-time/prerendering if needed, but better to keep the throw and fix the tree
    if (context === undefined) {
        return {
            notifications: [],
            unreadCount: 0,
            addNotification: () => { },
            markAsRead: () => { },
            markAllAsRead: () => { },
            removeNotification: () => { }
        };
    }
    return context;
};
