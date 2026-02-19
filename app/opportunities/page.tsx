'use client';

import React, { useState } from 'react';
import { OpportunityCard } from '@/components/OpportunityCard';
import { Button } from '@/components/Button';
import { useOpportunities } from '@/context/OpportunitiesContext';
import { useAuth } from '@/context/AuthContext';
import { Plus, X, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';

export default function OpportunitiesPage() {
    const {
        filteredOpportunities,
        addOpportunity,
        isLoading,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        locationFilter,
        setLocationFilter,
        locations
    } = useOpportunities();
    const { user } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'grant',
        deadline: '',
        location: '',
        link: '',
        image: ''
    });

    const categoryLabels: Record<string, string> = {
        'grant': 'Bourse / Financement',
        'open call': 'Appel à projets',
        'training': 'Formation',
        'residency': 'Résidence'
    };

    const categoriesList = Object.entries(categoryLabels);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addOpportunity(formData);
            setIsFormOpen(false);
            setFormData({
                title: '',
                description: '',
                category: 'grant',
                deadline: '',
                location: '',
                link: '',
                image: ''
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--sand-50)] pt-24 pb-12 text-left">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[var(--marketing-green)] rounded-3xl p-8 mb-12 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">Opportunités & Financements</h1>
                            <p className="text-green-50 max-w-2xl text-lg">
                                Développez votre carrière avec notre sélection d&apos;appels à projets, bourses, résidences et fonds de soutien.
                            </p>
                        </div>
                        {user && (
                            <Button
                                onClick={() => setIsFormOpen(true)}
                                className="bg-white text-[var(--marketing-green)] hover:bg-green-50 shadow-lg shrink-0 gap-2 px-6 py-4 rounded-2xl font-bold"
                            >
                                <Plus size={20} /> Publier une opportunité
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Rechercher une opportunité..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[var(--marketing-green)] outline-none"
                        />
                        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-45" size={18} />
                    </div>
                    <select
                        title="Filtrer par catégorie"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[var(--marketing-green)] outline-none cursor-pointer min-w-[200px]"
                    >
                        <option value="ALL">Toutes les catégories</option>
                        {categoriesList.map(([id, label]) => (
                            <option key={id} value={id}>{label}</option>
                        ))}
                    </select>
                    <select
                        title="Filtrer par lieu"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[var(--marketing-green)] outline-none cursor-pointer min-w-[180px]"
                    >
                        <option value="ALL">Tous les lieux</option>
                        {locations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[var(--marketing-green)]" size={40} />
                    </div>
                ) : filteredOpportunities.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-xl">Aucune opportunité ne correspond à vos critères.</p>
                        <Button
                            variant="ghost"
                            className="mt-4 text-[var(--marketing-green)]"
                            onClick={() => { setSearchQuery(''); setCategoryFilter('ALL'); setLocationFilter('ALL'); }}
                        >
                            Réinitialiser les filtres
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredOpportunities.map((opp, idx) => (
                            <div key={opp.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                <OpportunityCard {...opp} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Publication Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl my-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Publier une opportunité</h2>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Fermer">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Titre</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Bourse de création 2026"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[var(--marketing-green)] outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Catégorie</label>
                                    <select
                                        title="Sélectionner une catégorie"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[var(--marketing-green)] outline-none"
                                    >
                                        {categoriesList.map(([id, label]) => (
                                            <option key={id} value={id}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Pays / Région</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Niger, Afrique de l'Ouest"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[var(--marketing-green)] outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Date limite</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: 31 Mars 2026"
                                        value={formData.deadline}
                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[var(--marketing-green)] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Détails sur l'éligibilité, les montants, les documents requis..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[var(--marketing-green)] outline-none resize-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Lien externe / Contact</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[var(--marketing-green)] outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Image illustrative (optionnel)</label>
                                <ImageUpload
                                    value={formData.image}
                                    onChange={(base64) => setFormData({ ...formData, image: base64 })}
                                    onRemove={() => setFormData({ ...formData, image: '' })}
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-2xl text-lg font-bold bg-[var(--marketing-green)]"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : "Publier maintenant"}
                                </Button>
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    En publiant, vous acceptez que l&apos;administrateur retire votre contenu s&apos;il ne respecte pas les règles.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
