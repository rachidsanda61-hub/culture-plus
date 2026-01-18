
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/context/EventsContext';
import { Button } from '@/components/Button';
import { Trash2, Plus, LayoutDashboard, LogOut, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const { events, addEvent, deleteEvent } = useEvents();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        category: 'Musique',
        date: '',
        location: '',
        image: '',
        description: ''
    });

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            router.push('/admin');
        }
    }, [router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEvent = {
            ...formData,
            slug: formData.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
            likes: 0,
            interested: 0
        };
        addEvent(newEvent);
        alert('Événement ajouté avec succès !');
        setFormData({ title: '', category: 'Musique', date: '', location: '', image: '', description: '' });
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        router.push('/');
    };

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Admin Nav */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <LayoutDashboard className="text-[var(--marketing-orange)]" />
                    <span>Dashboard Admin</span>
                </div>
                <div className="flex gap-4">
                    <Link href="/admin/opportunities">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Briefcase size={16} /> Gérer Opportunités
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="sm">Voir le site</Button>
                    </Link>
                    <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                        <LogOut size={18} /> Déconnexion
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Formulaire d'ajout */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus className="text-[var(--marketing-green)]" />
                            Ajouter un événement
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Titre</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                    placeholder="Ex: Concert de la Paix"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Catégorie</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                >
                                    {['Musique', 'Festivals', 'Arts Visuels', 'Foire', 'Formation', 'Séminaire', 'Cinéma', 'Théâtre', 'Mode', 'Littérature'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Date</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                    placeholder="Ex: 12 Mars 2026"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Lieu</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                    placeholder="Ex: Niamey"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                    placeholder="Détails de l'événement..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Image URL (Optionnel)</label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                    placeholder="https://..."
                                />
                            </div>

                            <Button className="w-full justify-center mt-4">Publier l&apos;événement</Button>
                        </form>
                    </div>
                </div>

                {/* Liste des événements */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6">Événements en ligne ({events.length})</h2>

                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.slug} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            {event.image && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={event.image} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 line-clamp-1">{event.title}</h4>
                                            <p className="text-sm text-gray-500">{event.date} • {event.location}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => deleteEvent(event.slug)}
                                        className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
