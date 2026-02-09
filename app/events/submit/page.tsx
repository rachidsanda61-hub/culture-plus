'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/context/EventsContext';
import { Button } from '@/components/Button';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/ImageUpload';

export default function SubmitEventPage() {
    const { addEvent } = useEvents();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        category: 'Musique',
        date: '',
        location: '',
        image: '',
        description: '',
        price: 'Gratuit',
        startTime: '',
        endTime: '',
        organizer: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEvent = {
            ...formData,
            slug: formData.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
            likes: 0,
            interested: 0
        };
        addEvent(newEvent);
        router.push('/events');
    };

    return (
        <main className="min-h-screen bg-[var(--sand-50)] pt-24 pb-12">
            <div className="max-w-2xl mx-auto px-4">
                <Link href="/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--marketing-orange)] mb-6 transition-colors">
                    <ArrowLeft size={18} /> Retour aux événements
                </Link>

                <div className="flex flex-col items-center mb-10 text-center">
                    <h1 className="text-3xl font-bold mb-4">Proposer un événement</h1>
                    <p className="text-gray-600">
                        Vous êtes artiste, promoteur ou organisateur ? Ajoutez votre événement à l&apos;agenda culturel du Niger.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l&apos;événement</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                placeholder="Ex: Concert de la Paix"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none bg-white"
                                >
                                    {['Musique', 'Festivals', 'Arts Visuels', 'Foires', 'Formations', 'Séminaires', 'Cinéma', 'Théâtre', 'Mode', 'Littérature'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                    placeholder="Ex: 12 Mars 2026"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                            <input
                                required
                                type="text"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                placeholder="Ex: Niamey, CCFN"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Organisateur</label>
                            <input
                                required
                                type="text"
                                value={formData.organizer}
                                onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                placeholder="Ex: Maison de la Culture, CCFN, etc."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (ou Gratuit)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                    placeholder="Ex: 2000 FCFA"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Heure Début</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Heure Fin</label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--marketing-orange)] outline-none"
                                placeholder="Détaillez le programme, les artistes présents..."
                                rows={4}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image de l&apos;événement</label>
                            <ImageUpload
                                label=""
                                value={formData.image}
                                onChange={(base64) => setFormData({ ...formData, image: base64 })}
                                onRemove={() => setFormData({ ...formData, image: '' })}
                                aspectRatio="video"
                            />
                        </div>

                        <div className="pt-4">
                            <Button size="lg" className="w-full justify-center text-lg shadow-lg shadow-[var(--marketing-orange)]/20">
                                <Plus size={20} /> Publier l&apos;événement
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
