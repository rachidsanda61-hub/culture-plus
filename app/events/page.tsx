'use client';

import React from 'react';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/Button';
import { Search, Filter, Plus } from 'lucide-react';
import { useEvents } from '@/context/EventsContext';
import Link from 'next/link';

const CATEGORIES = ['Tout', 'Musique', 'Festivals', 'Arts Visuels', 'Foires', 'Formations', 'Séminaires', 'Cinéma', 'Littérature', 'Mode', 'Théâtre'];

export default function EventsPage() {
    const {
        filteredEvents,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        locationFilter,
        setLocationFilter,
        locations
    } = useEvents();

    return (
        <main className="min-h-screen bg-[var(--sand-50)] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-4xl font-bold text-[var(--charcoal-900)]">Événements Culturels</h1>
                            <Link href="/events/submit">
                                <Button size="sm" variant="outline" className="hidden sm:flex rounded-xl font-bold border-gray-200">
                                    <Plus className="w-4 h-4" /> Proposer
                                </Button>
                            </Link>
                        </div>
                        <p className="text-[var(--charcoal-600)] max-w-xl text-lg">
                            Explorez la richesse culturelle du Niger. Concerts, expositions et festivals partout dans le pays.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-4 py-3 rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:border-[var(--marketing-orange)] focus:ring-4 focus:ring-[var(--marketing-orange)]/5 w-64 bg-white transition-all"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>

                        <div className="relative group min-w-[160px]">
                            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                            <select
                                title="Filtrer par ville"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="pl-11 pr-8 py-3 w-full rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:border-[var(--marketing-orange)] focus:ring-4 focus:ring-[var(--marketing-orange)]/5 bg-white appearance-none cursor-pointer text-sm font-medium transition-all"
                            >
                                <option value="ALL">Toute les villes</option>
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-2 pb-6 mb-2 no-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat === 'Tout' ? 'ALL' : cat)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${(categoryFilter === 'ALL' && cat === 'Tout') || categoryFilter === cat
                                    ? 'bg-[var(--marketing-orange)] text-white shadow-lg shadow-[var(--marketing-orange)]/20 scale-105'
                                    : 'bg-white text-[var(--charcoal-600)] hover:bg-gray-50 border border-gray-100 shadow-sm'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event, idx) => (
                            <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                <EventCard {...event} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                                <Search size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun événement trouvé</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Essayez de modifier vos critères de recherche ou vos filtres.</p>
                            <Button
                                variant="ghost"
                                className="mt-6 text-[var(--marketing-orange)] font-bold hover:bg-orange-50"
                                onClick={() => { setCategoryFilter('ALL'); setSearchQuery(''); setLocationFilter('ALL'); }}
                            >
                                Réinitialiser tous les filtres
                            </Button>
                        </div>
                    )}
                </div>

                {/* Load More */}
                <div className="mt-16 text-center">
                    <Button variant="outline" size="lg">Charger plus d&apos;événements</Button>
                </div>

            </div>
        </main>
    );
}
