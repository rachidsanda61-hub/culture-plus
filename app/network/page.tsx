
'use client';

import React from 'react';
import { ProfileCard } from '@/components/ProfileCard';
import { Button } from '@/components/Button';
import { ProfileType } from '@prisma/client';
import { Search, Filter, Globe, Building2 } from 'lucide-react';
import { useProfiles } from '@/context/ProfilesContext';

const TYPE_LABELS: Record<string, string> = {
    'ALL': 'Tous les profils',
    [ProfileType.INDIVIDUAL]: 'Particuliers',
    [ProfileType.INTERNATIONAL_ORGANIZATION]: 'Organisations Int.',
    [ProfileType.DIPLOMATIC_ORGANIZATION]: 'Diplomatie',
    [ProfileType.STATE_SERVICE]: 'Services de l\'État',
    [ProfileType.NIGHT_CLUB]: 'Établissements de nuit',
    [ProfileType.RESTAURANT]: 'Restaurants',
    [ProfileType.HOTEL]: 'Hôtels',
    [ProfileType.CULTURAL_ENTERPRISE]: 'Entreprises Culturelles',
    [ProfileType.ASSOCIATION_NGO]: 'Associations & ONG',
};

export default function NetworkPage() {
    const {
        profiles,
        filteredProfiles,
        searchQuery,
        setSearchQuery,
        selectedType,
        setSelectedType,
        selectedCountry,
        setSelectedCountry
    } = useProfiles();

    // Get unique countries for filter
    const countries = Array.from(new Set(profiles.map(p => p.country).filter(Boolean))) as string[];

    return (
        <main className="min-h-screen bg-[var(--sand-50)] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Le Réseau Culture+</h1>
                    <p className="text-[var(--charcoal-600)] max-w-2xl mx-auto">
                        Connectez-vous avec les talents qui font vibrer la culture au Niger. Artistes, promoteurs, institutions : ils sont tous ici.
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-6">
                        <div className="relative w-full max-w-2xl mx-auto group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Trouver un artiste, un promoteur, une institution..."
                                className="w-full pl-14 pr-6 py-4 rounded-3xl border border-gray-200 focus:outline-none focus:border-[var(--marketing-orange)] focus:ring-4 focus:ring-[var(--marketing-orange)]/10 shadow-sm text-lg transition-all"
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--marketing-orange)] transition-colors" size={24} />
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl">
                            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm group">
                                <Building2 size={18} className="text-gray-400 group-hover:text-[var(--marketing-orange)] transition-colors" />
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value as any)}
                                    className="bg-transparent border-none outline-none text-sm font-semibold text-gray-700 cursor-pointer pr-8"
                                    title="Filtrer par type de profil"
                                >
                                    <option value="ALL">Tous les types</option>
                                    {(Object.values(ProfileType) as ProfileType[]).map(type => (
                                        <option key={type} value={type}>{TYPE_LABELS[type]}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm group">
                                <Globe size={18} className="text-gray-400 group-hover:text-[var(--marketing-orange)] transition-colors" />
                                <select
                                    value={selectedCountry}
                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm font-semibold text-gray-700 cursor-pointer pr-8"
                                    title="Filtrer par pays"
                                >
                                    <option value="ALL">Tous les pays</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>

                            {(searchQuery || selectedType !== 'ALL' || selectedCountry !== 'ALL') && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedType('ALL');
                                        setSelectedCountry('ALL');
                                    }}
                                    className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-sm font-bold text-gray-500 transition-all flex items-center gap-2"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>
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
