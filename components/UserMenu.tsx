'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, ChevronDown, Activity, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/50 transition-all border border-transparent hover:border-gray-100"
            >
                <div className="w-8 h-8 rounded-full bg-[var(--marketing-orange)] text-white flex items-center justify-center font-bold border-2 border-white shadow-sm overflow-hidden">
                    {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : (user.name ? user.name[0] : 'U')}
                </div>
                <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold leading-tight truncate max-w-[100px]">{user.name}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="p-2">
                        {user.role !== 'public' && (
                            <Link
                                href={`/network/${user.id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-[var(--sand-100)] transition-colors group"
                                onClick={() => setIsOpen(false)}
                            >
                                <UserCircle size={18} className="text-gray-400 group-hover:text-[var(--marketing-orange)]" />
                                <span>Mon Profil Public</span>
                            </Link>
                        )}
                        <Link
                            href="/settings/profile"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-[var(--sand-100)] transition-colors group"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings size={18} className="text-gray-400 group-hover:text-[var(--marketing-orange)]" />
                            <span>Paramètres</span>
                        </Link>

                        {(user as any).appRole === 'ADMIN' && (
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-purple-600 hover:bg-purple-50 transition-colors group"
                                onClick={() => setIsOpen(false)}
                            >
                                <Activity size={18} className="text-purple-400 group-hover:text-purple-600" />
                                <span className="font-bold">Dashboard Admin</span>
                            </Link>
                        )}
                    </div>

                    <div className="p-2 border-t border-gray-50">
                        <button
                            onClick={() => { logout(); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors group"
                        >
                            <LogOut size={18} className="text-red-400 group-hover:text-red-600" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
