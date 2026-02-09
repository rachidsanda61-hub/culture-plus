
'use client';

import React from 'react';
import { ProfileCard } from '@/components/ProfileCard';
import { Button } from '@/components/Button';
import { Search } from 'lucide-react';
import { useProfiles } from '@/context/ProfilesContext';

export default function NetworkPage() {
    const { filteredProfiles, searchQuery, setSearchQuery } = useProfiles();

    return (
        <main className="min-h-screen bg-[var(--sand-50)] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Le Réseau Culture+</h1>
                    <p className="text-[var(--charcoal-600)] max-w-2xl mx-auto">
                        Connectez-vous avec les talents qui font vibrer la culture au Niger. Artistes, promoteurs, institutions : ils sont tous ici.
                    </p>

                    <div className="mt-8 relative max-w-lg mx-auto">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Trouver un artiste, un promoteur..."
                            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-[var(--marketing-orange)] focus:ring-2 focus:ring-[var(--marketing-orange)]/20 shadow-sm"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfiles.length > 0 ? filteredProfiles.map((profile) => (
                        <ProfileCard key={profile.id} {...profile} />
                    )) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-gray-500 text-lg">Aucun profil ne correspond à votre recherche.</p>
                            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>Réinitialiser la recherche</Button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
