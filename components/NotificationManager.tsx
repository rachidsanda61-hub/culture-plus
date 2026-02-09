'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, BellRing, Settings, Clock, Trash2, ExternalLink, Inbox, UserPlus, Heart, MessageCircle, Star } from 'lucide-react';
import { useNotifications, AppNotification } from '@/context/NotificationsContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const NotificationManager = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isOpen, setIsOpen] = useState(false);
    const { notifications = [], unreadCount = 0, markAsRead, markAllAsRead, removeNotification } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(window.Notification.permission);
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const requestPermission = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        const result = await window.Notification.requestPermission();
        setPermission(result);
    };

    const handleNotifClick = (notif: AppNotification) => {
        if (markAsRead) markAsRead(notif.id);
        setIsOpen(false);
        if (notif.link) router.push(notif.link);
    };

    const safeFormatDistance = (date: any) => {
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';
            return formatDistanceToNow(d, { addSuffix: true, locale: fr });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all relative ${unreadCount > 0
                    ? 'text-[var(--marketing-orange)] bg-[var(--marketing-orange)]/5'
                    : 'text-[var(--charcoal-600)] hover:bg-[var(--sand-100)]'
                    }`}
                title="Notifications"
            >
                {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-[10px] font-bold text-[var(--marketing-orange)] hover:underline uppercase tracking-wider">
                                    Tout lu
                                </button>
                            )}
                            <button onClick={requestPermission} className="text-gray-400 hover:text-gray-600">
                                <Settings size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => {
                                    const NotificationWrapper = notif.link ? Link : 'div' as any;
                                    return (
                                        <div
                                            key={notif.id}
                                            className={`relative group ${!notif.read ? 'bg-orange-50/30' : 'hover:bg-gray-50'} transition-colors`}
                                        >
                                            <NotificationWrapper
                                                href={notif.link || '#'}
                                                className="p-4 flex gap-4 cursor-pointer block w-full"
                                                onClick={() => {
                                                    if (markAsRead) markAsRead(notif.id);
                                                    setIsOpen(false);
                                                }}
                                            >
                                                {!notif.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[var(--marketing-orange)] rounded-full"></div>}

                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-[var(--marketing-orange)]">
                                                    {notif.image ? (
                                                        <img src={notif.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        notif.type === 'message' ? <Inbox size={20} /> :
                                                            notif.type === 'follow' ? <UserPlus size={20} /> :
                                                                notif.type === 'like' ? <Heart size={20} /> :
                                                                    notif.type === 'comment' ? <MessageCircle size={20} /> :
                                                                        notif.type === 'review' ? <Star size={20} /> :
                                                                            <Bell size={20} />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className={`text-sm leading-tight ${!notif.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                        <Clock size={10} />
                                                        {safeFormatDistance(notif.date)}
                                                    </div>
                                                </div>
                                            </NotificationWrapper>

                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeNotification(notif.id); }}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all z-10"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                    <Bell size={32} />
                                </div>
                                <p className="text-sm">Aucune notification pour le moment.</p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-50 bg-gray-50/30 text-center">
                            <button className="text-xs font-bold text-gray-500 hover:text-[var(--marketing-orange)] transition-colors inline-flex items-center gap-1">
                                Voir l'historique <ExternalLink size={10} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
