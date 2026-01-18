
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, Mail } from 'lucide-react';
import { Button } from '@/components/Button';
import { NotificationManager } from './NotificationManager';
import { useMessages } from '@/context/MessagesContext';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { unreadCount } = useMessages();

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
                        <button className="text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)]">
                            <Search size={20} />
                        </button>

                        <Link href="/messages" className="relative text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)]">
                            <Mail size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>

                        <NotificationManager />
                        <Button variant="primary" size="sm">Connexion</Button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        <Link href="/messages" className="relative text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] md:hidden">
                            <Mail size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-[var(--charcoal-900)] hover:text-[var(--marketing-orange)] focus:outline-none"
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
                        >
                            Événements
                        </Link>
                        <Link
                            href="/opportunities"
                            className="block px-3 py-2 rounded-md text-base font-medium text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] hover:bg-[var(--sand-100)]"
                        >
                            Opportunités
                        </Link>
                        <Link
                            href="/network"
                            className="block px-3 py-2 rounded-md text-base font-medium text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] hover:bg-[var(--sand-100)]"
                        >
                            Réseau
                        </Link>
                        <Link
                            href="/messages"
                            className="block px-3 py-2 rounded-md text-base font-medium text-[var(--charcoal-600)] hover:text-[var(--marketing-orange)] hover:bg-[var(--sand-100)]"
                        >
                            Messagerie
                            {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                        </Link>

                        <div className="pt-4 flex flex-col gap-3">
                            <Button variant="primary" className="w-full">Connexion</Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
