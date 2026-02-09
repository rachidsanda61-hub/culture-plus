'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, Mail } from 'lucide-react';
import { useProfiles } from '@/context/ProfilesContext';
import { Button } from '@/components/Button';
import { NotificationManager } from './NotificationManager';
import { useMessages } from '@/context/MessagesContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useAuth } from '@/context/AuthContext';
import { UserMenu } from './UserMenu';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const { unreadCount: messageCount } = useMessages();
    const { user, logout } = useAuth();
    const { searchQuery, setSearchQuery } = useProfiles();
    const router = useRouter();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (window.location.pathname !== '/network') {
            router.push('/network');
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--marketing-orange)] to-[#FF8C42]">
                            Culture+
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/events" className="text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] transition-colors font-medium">
                            Événements
                        </Link>
                        <Link href="/opportunities" className="text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] transition-colors font-medium">
                            Opportunités
                        </Link>
                        <Link href="/network" className="text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] transition-colors font-medium">
                            Réseau
                        </Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className={`relative flex items-center transition-all duration-300 ${showSearch ? 'w-64' : 'w-10'}`}>
                            <button
                                title="Rechercher"
                                onClick={() => setShowSearch(!showSearch)}
                                className={`p-2 rounded-full hover:bg-[var(--sand-100)] transition-colors ${showSearch ? 'text-[var(--marketing-orange)]' : 'text-[var(--charcoal-600)]'}`}
                            >
                                <Search size={20} />
                            </button>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className={`absolute left-10 w-full bg-white border-b border-gray-200 focus:border-[var(--marketing-orange)] outline-none text-sm transition-all duration-300 ${showSearch ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                                onBlur={() => !searchQuery && setShowSearch(false)}
                            />
                        </div>

                        <Link href="/messages" className="relative text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)]">
                            <Mail size={20} />
                            {messageCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[var(--marketing-orange)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] flex items-center justify-center border border-white">
                                    {messageCount}
                                </span>
                            )}
                        </Link>

                        <NotificationManager />

                        {user ? (
                            <UserMenu />
                        ) : (
                            <Link href="/login">
                                <Button variant="primary" size="sm">Connexion</Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile header actions */}
                    <div className="md:hidden flex items-center gap-1">
                        <Link href="/messages" className="relative p-2 text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)]">
                            <Mail size={22} />
                            {messageCount > 0 && (
                                <span className="absolute top-1 right-1 bg-[var(--marketing-orange)] text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[14px] flex items-center justify-center border border-white">
                                    {messageCount}
                                </span>
                            )}
                        </Link>

                        <NotificationManager />

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-[var(--charcoal-900)] hover:text-[var(--marketing-orange)] focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass-panel border-t border-white/20 animate-in slide-in-from-top-4 duration-300">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link
                            href="/events"
                            className="block px-3 py-2 rounded-md text-base font-medium text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] hover:bg-[var(--sand-100)]"
                            onClick={() => setIsOpen(false)}
                        >
                            Événements
                        </Link>
                        <Link
                            href="/opportunities"
                            className="block px-3 py-2 rounded-md text-base font-medium text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] hover:bg-[var(--sand-100)]"
                            onClick={() => setIsOpen(false)}
                        >
                            Opportunités
                        </Link>
                        <Link
                            href="/network"
                            className="block px-3 py-2 rounded-md text-base font-medium text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] hover:bg-[var(--sand-100)]"
                            onClick={() => setIsOpen(false)}
                        >
                            Réseau
                        </Link>

                        <div className="px-3 py-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un profil..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--marketing-orange)]"
                                />
                            </div>
                        </div>


                        <div className="pt-4 flex flex-col gap-3">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-[var(--marketing-orange)] text-white flex items-center justify-center font-bold overflow-hidden">
                                            {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : (user.name ? user.name[0] : 'U')}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{user.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                        </div>
                                    </div>
                                    <Link href="/settings/profile" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full">Paramètres</Button>
                                    </Link>
                                    {(user as any).appRole === 'ADMIN' && (
                                        <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                                            <Button variant="outline" className="w-full text-purple-600 border-purple-100 font-bold">Dashboard Admin</Button>
                                        </Link>
                                    )}
                                    <Button variant="outline" className="w-full text-red-500 border-red-100" onClick={() => { logout(); setIsOpen(false); }}>Déconnexion</Button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="primary" className="w-full">Connexion</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
