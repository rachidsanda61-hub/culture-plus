'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOpportunities } from '@/context/OpportunitiesContext';
import { Button } from '@/components/Button';
import { ArrowLeft, Trash2, Plus, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AdminOpportunitiesPage() {
    const router = useRouter();
    const { opportunities, addOpportunity, deleteOpportunity } = useOpportunities();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'Financement', // Default
        deadline: '',
        amount: '',
        organization: '',
        description: '',
        link: ''
    });

    useEffect(() => {
        const auth = localStorage.getItem('isAdmin');
        if (!auth) {
            router.push('/admin');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addOpportunity({
            ...formData,
            // Format simple de date si nécessaire, ici on prend tel quel
        });
        toast.success('Opportunité ajoutée !');
        setFormData({
            title: '',
            type: 'Financement',
            deadline: '',
            amount: '',
            organization: '',
            description: '',
            link: ''
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft size={20} /> Retour Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Briefcase className="text-[var(--marketing-green)]" />
                        Gérer les Opportunités
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulaire d'ajout */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus size={20} /> Nouvelle Opportunité
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-green)]"
                                    required
                                    placeholder="Ex: Appel à projets..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-green)]"
                                >
                                    <option value="Financement">Financement</option>
                                    <option value="Bourse">Bourse</option>
                                    <option value="Résidence">Résidence</option>
                                    <option value="Fonds de Mobilité">Fonds de Mobilité</option>
                                    <option value="Formation">Formation</option>
                                    <option value="Concours">Concours</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
                                <input
                                    type="text"
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-green)]"
                                    required
                                    placeholder="Ex: Institut Français"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                    <input
                                        type="text"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-green)]"
                                        placeholder="Ex: 30 Jan 2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                                    <input
                                        type="text"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-green)]"
                                        placeholder="Ex: 500.000 FCFA"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description courte</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-green)]"
                                    rows={3}
                                />
                            </div>

                            <Button type="submit" className="w-full bg-[var(--marketing-green)] hover:bg-green-700 text-white">
                                Ajouter l'opportunité
                            </Button>
                        </form>
                    </div>

                    {/* Liste des opportunités */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold mb-6">Opportunités Actives ({opportunities.length})</h2>
                        {opportunities.map((opp) => (
                            <div key={opp.id} className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-bold text-[var(--marketing-green)] bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                            {opp.type}
                                        </span>
                                        <span className="text-xs text-gray-400">Deadline: {opp.deadline}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900">{opp.title}</h3>
                                    <p className="text-sm text-gray-500">{opp.organization} • {opp.amount}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Supprimer cette opportunité ?')) deleteOpportunity(opp.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
