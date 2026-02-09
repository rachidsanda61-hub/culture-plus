'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, Mail } from 'lucide-react';
import { useMessages } from '@/context/MessagesContext';

export const BottomNav = () => {
    const pathname = usePathname();
    const { unreadCount: messageCount = 0 } = useMessages() || {};

    const navItems = [
        { icon: Home, label: 'Accueil', path: '/' },
        { icon: Calendar, label: 'Événements', path: '/events' },
        { icon: Users, label: 'Réseau', path: '/network' },
        { icon: Mail, label: 'Messages', path: '/messages', count: messageCount },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-3 z-[60] flex justify-around items-center rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 relative px-4 py-1 rounded-2xl ${isActive ? 'text-[var(--marketing-orange)]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                            <Icon size={22} className={isActive ? 'fill-[var(--marketing-orange)]/10' : ''} />
                            {item.count !== undefined && item.count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[14px] flex items-center justify-center border-2 border-white">
                                    {item.count}
                                </span>
                            )}
                        </div>
                        <span className={`text-[10px] font-bold tracking-tight transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                            {item.label}
                        </span>
                        {isActive && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[var(--marketing-orange)] rounded-full -mt-0.5" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
};
