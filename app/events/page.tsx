'use client';

import React from 'react';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/Button';
import { Search, Filter, Plus } from 'lucide-react';
import { useEvents } from '@/context/EventsContext';
import Link from 'next/link';

const CATEGORIES = ['Tout', 'Musique', 'Festivals', 'Arts Visuels', 'Foires', 'Formations', 'Séminaires', 'Cinéma', 'Littérature', 'Mode', 'Théâtre'];

export default function EventsPage() {
    const { events } = useEvents();
    const [selectedCategory, setSelectedCategory] = React.useState('Tout');
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredEvents = events.filter(event => {
        const eventCat = event.category.trim();
        // Defensive check: handle common singular/plural mismatches for the UI tabs
        const matchesCategory = selectedCategory === 'Tout' ||
            eventCat === selectedCategory ||
            (selectedCategory === 'Formations' && eventCat === 'Formation') ||
            (selectedCategory === 'Foires' && eventCat === 'Foire') ||
            (selectedCategory === 'Séminaires' && eventCat === 'Séminaire') ||
            (selectedCategory === 'Festivals' && eventCat === 'Festival');

        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <main className="min-h-screen bg-[var(--sand-50)] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-4xl font-bold">Événements Culturels</h1>
                            <Link href="/events/submit">
                                <Button size="sm" variant="outline" className="hidden sm:flex">
                                    <Plus className="w-4 h-4" /> Proposer
                                </Button>
                            </Link>
                        </div>
                        <p className="text-[var(--charcoal-600)] max-w-xl">
                            Explorez la richesse culturelle du Niger. Concerts, expositions, foires, formations et seminaires partout dans le pays.
                        </p>
                        <Link href="/events/submit" className="sm:hidden mt-4 inline-block">
                            <Button size="sm" variant="outline">
                                <Plus className="w-4 h-4" /> Proposer un événement
                            </Button>
                        </Link>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-[var(--marketing-orange)] focus:ring-1 focus:ring-[var(--marketing-orange)] w-64 bg-white"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-2 pb-6 mb-2 no-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-[var(--charcoal-900)] text-white' : 'bg-white text-[var(--charcoal-600)] hover:bg-[var(--sand-100)]'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event, idx) => (
                            <EventCard key={idx} {...event} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-gray-500">Aucun événement ne correspond à vos critères.</p>
                            <Button
                                variant="ghost"
                                className="mt-4 text-[var(--marketing-orange)]"
                                onClick={() => { setSelectedCategory('Tout'); setSearchQuery(''); }}
                            >
                                Réinitialiser les filtres
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
