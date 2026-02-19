'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Briefcase, User, Loader2, X, ArrowRight } from 'lucide-react';
import { useEvents } from '@/context/EventsContext';
import { useOpportunities } from '@/context/OpportunitiesContext';
import { useProfiles } from '@/context/ProfilesContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const { events } = useEvents();
    const { opportunities } = useOpportunities();
    const { profiles: allProfiles } = useProfiles();
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    const [results, setResults] = useState<{
        events: any[],
        opportunities: any[],
        profiles: any[]
    }>({ events: [], opportunities: [], profiles: [] });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults({ events: [], opportunities: [], profiles: [] });
            setIsOpen(false);
            return;
        }

        const q = query.toLowerCase();

        const filteredEvents = events.filter(e =>
            e.title.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q)
        ).slice(0, 3);

        const filteredOpp = opportunities.filter(o =>
            o.title.toLowerCase().includes(q) ||
            o.category.toLowerCase().includes(q)
        ).slice(0, 3);

        const filteredProfiles = allProfiles.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.role.toLowerCase().includes(q) ||
            p.organization_name?.toLowerCase().includes(q)
        ).slice(0, 3);

        setResults({
            events: filteredEvents,
            opportunities: filteredOpp,
            profiles: filteredProfiles
        });
        setIsOpen(true);
    }, [query, events, opportunities, allProfiles]);

    const hasResults = results.events.length > 0 || results.opportunities.length > 0 || results.profiles.length > 0;

    return (
        <div className="relative flex-1 max-w-md mx-4" ref={searchRef}>
            <div className={`relative flex items-center transition-all duration-300 ${isFocused ? 'ring-2 ring-[var(--marketing-orange)]/20 shadow-lg' : ''} bg-gray-50 rounded-2xl border border-gray-100`}>
                <Search size={18} className={`absolute left-4 transition-colors ${isFocused ? 'text-[var(--marketing-orange)]' : 'text-gray-400'}`} />
                <input
                    type="text"
                    placeholder="Rechercher partout..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        if (query.length >= 2) setIsOpen(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-transparent border-none py-2.5 pl-11 pr-10 text-sm font-medium focus:ring-0 placeholder:text-gray-400"
                />
                {query && (
                    <button
                        title="Effacer la recherche"
                        onClick={() => setQuery('')}
                        className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={14} className="text-gray-400" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                    {!hasResults ? (
                        <div className="p-8 text-center bg-gray-50/50">
                            <p className="text-sm text-gray-500">Aucun résultat pour &quot;{query}&quot;</p>
                        </div>
                    ) : (
                        <div className="max-h-[70vh] overflow-y-auto">
                            {/* Profiles */}
                            {results.profiles.length > 0 && (
                                <div className="p-2">
                                    <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <User size={12} /> Réseau
                                    </div>
                                    {results.profiles.map(p => (
                                        <Link
                                            key={p.id}
                                            href={`/network/${p.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[var(--marketing-orange)] overflow-hidden flex-shrink-0 border-2 border-white shadow-sm font-bold text-white flex items-center justify-center">
                                                {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : p.name[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[var(--marketing-orange)] transition-colors">{p.organization_name || p.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{p.role}</p>
                                            </div>
                                            <ArrowRight size={14} className="text-gray-300 group-hover:text-[var(--marketing-orange)] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Events */}
                            {results.events.length > 0 && (
                                <div className="p-2 border-t border-gray-50">
                                    <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <Calendar size={12} /> Événements
                                    </div>
                                    {results.events.map(e => (
                                        <Link
                                            key={e.id}
                                            href={`/events/${e.slug}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-orange-100 overflow-hidden flex-shrink-0 shadow-sm">
                                                {e.image ? <img src={e.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[var(--marketing-orange)]"><Calendar size={18} /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[var(--marketing-orange)] transition-colors">{e.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{e.category} • {e.location}</p>
                                            </div>
                                            <ArrowRight size={14} className="text-gray-300 group-hover:text-[var(--marketing-orange)] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Opportunities */}
                            {results.opportunities.length > 0 && (
                                <div className="p-2 border-t border-gray-50">
                                    <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <Briefcase size={12} /> Opportunités
                                    </div>
                                    {results.opportunities.map(o => (
                                        <Link
                                            key={o.id}
                                            href="/opportunities"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-green-100 overflow-hidden flex-shrink-0 shadow-sm">
                                                {o.image ? <img src={o.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[var(--marketing-green)]"><Briefcase size={18} /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[var(--marketing-orange)] transition-colors">{o.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{o.category} • Niamey</p>
                                            </div>
                                            <ArrowRight size={14} className="text-gray-300 group-hover:text-[var(--marketing-orange)] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className="p-3 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push(`/network?q=${query}`);
                                    }}
                                    className="w-full py-2 text-xs font-bold text-gray-500 hover:text-[var(--marketing-orange)] transition-colors flex items-center justify-center gap-2"
                                >
                                    Voir tous les résultats pour &quot;{query}&quot;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
