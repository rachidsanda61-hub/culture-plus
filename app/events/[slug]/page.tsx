'use client';

import { useEvents } from '@/context/EventsContext';
import { Button } from '@/components/Button';
import { Calendar, MapPin, Heart, Star, ArrowLeft, Share2, Users, Clock, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function EventDetailPage() {
    const { slug } = useParams();
    const { events, likeEvent, interestEvent } = useEvents();
    const { user } = useAuth();
    const router = useRouter();

    const event = events.find(e => e.slug === slug);

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 text-center">
                <div className="bg-orange-50 p-6 rounded-full mb-6">
                    <Calendar size={48} className="text-[var(--marketing-orange)]" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Événement introuvable</h1>
                <p className="text-gray-600 mb-8">Désolé, cet événement n&apos;existe plus ou a été déplacé.</p>
                <Link href="/events">
                    <Button>Retour aux événements</Button>
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--sand-50)] pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4">
                {/* Navigation */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--marketing-orange)] mb-8 transition-colors group"
                >
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /> Retour
                </button>

                {/* Hero Section */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-12">
                    <div className="h-64 md:h-[400px] relative">
                        {event.image ? (
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--marketing-orange)] to-[var(--marketing-red)] flex items-center justify-center text-white/30">
                                <span>Image indisponible</span>
                            </div>
                        )}
                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-[var(--marketing-orange)] shadow-lg uppercase tracking-wide">
                            {event.category}
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--charcoal-900)] mb-8 leading-tight">
                            {event.title}
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-50 rounded-xl">
                                        <Calendar className="text-[var(--marketing-orange)]" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Date & Heure</p>
                                        <p className="text-xl font-bold text-[var(--charcoal-900)]">
                                            {event.date}
                                            {event.startTime && ` • ${event.startTime}`}
                                            {event.endTime && ` - ${event.endTime}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-50 rounded-xl">
                                        <MapPin className="text-[var(--marketing-orange)]" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Localisation</p>
                                        <p className="text-xl font-bold text-[var(--charcoal-900)]">{event.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        <Users className="text-blue-500" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Organisateur</p>
                                        <p className="text-xl font-bold text-[var(--charcoal-900)]">{event.organizer || "Non précisé"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-50 rounded-xl">
                                        <CreditCard className="text-green-500" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Prix d&apos;entrée</p>
                                        <p className="text-xl font-bold text-[var(--charcoal-900)]">{event.price || "Gratuit"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[var(--sand-50)] rounded-2xl p-6 border border-gray-100 flex flex-col justify-center">
                                <div className="flex items-center justify-around">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-1 text-red-500">
                                            <Heart size={20} fill="#EF4444" />
                                        </div>
                                        <p className="text-2xl font-bold">{event.likes}</p>
                                        <p className="text-xs text-gray-500 font-medium">Likes</p>
                                    </div>
                                    <div className="w-[1px] h-12 bg-gray-200" />
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-1 text-yellow-500">
                                            <Star size={20} fill="#F59E0B" />
                                        </div>
                                        <p className="text-2xl font-bold">{event.interested}</p>
                                        <p className="text-xs text-gray-500 font-medium">Étoiles</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-lg max-w-none mb-12">
                            <h2 className="text-2xl font-bold mb-4">À propos de l&apos;événement</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {event.description || "Aucune description supplémentaire fournie pour cet événement."}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
                            <Button
                                size="lg"
                                className="flex-1 gap-2"
                                onClick={() => likeEvent(event.slug)}
                            >
                                <Heart size={20} /> Like
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 gap-2 border-[var(--marketing-orange)] text-[var(--marketing-orange)] hover:bg-orange-50"
                                onClick={() => interestEvent(event.slug)}
                            >
                                <Star size={20} /> Je suis intéressé
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="sm:w-16 p-0 group"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({ title: event.title, url: window.location.href });
                                    }
                                }}
                            >
                                <Share2 size={24} className="group-hover:scale-110 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer simple suggestion */}
                <div className="text-center">
                    <p className="text-gray-500 text-sm mb-4 flex items-center justify-center gap-2">
                        <Users size={16} /> Vous voulez organiser un événement ?
                    </p>
                    <Link href="/events/submit">
                        <Button variant="ghost" className="text-[var(--marketing-orange)] font-bold">
                            Proposer mon événement gratuitement
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
