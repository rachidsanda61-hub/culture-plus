'use client';

import React from 'react';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/Button';
import { Search, Filter, Plus } from 'lucide-react';
import { useEvents } from '@/context/EventsContext';
import Link from 'next/link';

export default function EventsPage() {
    const events = [
        {
            title: "Festival de la Mode Nigérienne - FIMA 2026",
            category: "Mode & Design",
            date: "12 Déc 2026",
            location: "Niamey, Palais des Congrès",
            slug: "fima-2026",
        },
        {
            title: "Concert de la Paix - Sahel Tour",
            category: "Musique",
            date: "05 Nov 2026",
            location: "Agadez, Stade Régional",
            slug: "sahel-tour",
            image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "Foire Artisanale de Dosso",
            category: "Foire",
            date: "12 Mar 2026",
            location: "Dosso, Place des Artisans",
            slug: "foire-dosso"
        },
        {
            title: "Formation : Marketing Digital pour Artistes",
            category: "Formation",
            date: "18 Fev 2026",
            location: "Niamey, Incubateur CIPMEN",
            slug: "formation-marketing"
        },
        {
            title: "Exposition d'Art Touareg Contemporain",
            category: "Exposition",
            date: "20 Oct - 05 Nov",
            location: "Zinder, Centre Culturel",
            slug: "art-touareg"
        },
        {
            title: "Séminaire : Droit d'auteur au Niger",
            category: "Séminaire",
            date: "05 Avr 2026",
            location: "Niamey, Grand Hôtel",
            slug: "seminaire-droit-auteur"
        },
        {
            title: "Atelier d'Écriture Slam & Poésie",
            category: "Littérature",
            date: "15 Jan 2026",
            location: "Niamey, CCFN",
            slug: "atelier-slam"
        },
        {
            title: "Danse Traditionnelle du Manga",
            category: "Danse",
            date: "02 Fev 2026",
            location: "Diffa, Maison de la Culture",
            slug: "danse-manga"
        },
        {
            title: "Projection Plein Air : 'L'Arbre sans fruit'",
            category: "Cinéma",
            date: "10 Jan 2026",
            location: "Maradi, Place Publique",
            slug: "projection-plein-air"
        }
    ];

    return (
        <main className="min-h-screen bg-[var(--sand-50)] py-12">
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
                                className="pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-[var(--marketing-orange)] focus:ring-1 focus:ring-[var(--marketing-orange)] w-64 bg-white"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                        <Button variant="outline" className="px-3">
                            <Filter size={20} />
                        </Button>
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-2 pb-6 mb-2 no-scrollbar">
                    {['Tout', 'Musique', 'Festivals', 'Arts Visuels', 'Foires', 'Formations', 'Séminaires', 'Cinéma', 'Littérature', 'Mode', 'Théâtre'].map((cat, i) => (
                        <button
                            key={cat}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-[var(--charcoal-900)] text-white' : 'bg-white text-[var(--charcoal-600)] hover:bg-[var(--sand-100)]'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, idx) => (
                        <EventCard key={idx} {...event} />
                    ))}
                </div>

                {/* Load More */}
                <div className="mt-16 text-center">
                    <Button variant="outline" size="lg">Charger plus d&apos;événements</Button>
                </div>

            </div>
        </main>
    );
}
