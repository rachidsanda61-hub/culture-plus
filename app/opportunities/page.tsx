'use client';

import React from 'react';
import { OpportunityCard } from '@/components/OpportunityCard';
import { Button } from '@/components/Button';
import { useOpportunities } from '@/context/OpportunitiesContext';

export default function OpportunitiesPage() {
    const { opportunities } = useOpportunities();

    return (
        <main className="min-h-screen bg-[var(--sand-50)] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[var(--marketing-green)] rounded-3xl p-8 mb-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-4">Opportunités & Financements</h1>
                        <p className="text-green-50 max-w-2xl text-lg">
                            Développez votre carrière avec notre sélection d&apos;appels à projets, bourses, résidences et fonds de soutien dédiés aux acteurs culturels.
                        </p>
                    </div>
                </div>

                {opportunities.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl">Aucune opportunité disponible pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {opportunities.map((opp) => (
                            <OpportunityCard key={opp.id} {...opp} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
