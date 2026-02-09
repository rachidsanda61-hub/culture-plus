'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Loader2, ArrowLeft, Briefcase, Users, Star, Building2, Video, Tent, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'public'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(formData);
            router.push('/');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <main className="min-h-screen pt-24 pb-12 bg-[var(--sand-50)] flex items-center justify-center px-4">
            <div className="max-w-xl w-full">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--marketing-orange)] mb-8 transition-colors">
                    <ArrowLeft size={20} /> Retour à l'accueil
                </Link>

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold mb-2">Rejoindre Culture+</h1>
                        <p className="text-gray-500 text-sm">Créez votre compte pour accéder à toutes les fonctionnalités</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nom Complet</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Votre nom"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                    />
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+227 -- -- -- --"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                    />
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="exemple@mail.com"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="show-password"
                                    checked={showPassword}
                                    onChange={(e) => setShowPassword(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[var(--marketing-orange)] focus:ring-[var(--marketing-orange)] cursor-pointer"
                                />
                                <label htmlFor="show-password" className="text-xs text-gray-500 cursor-pointer select-none">
                                    Voir le mot de passe
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Vous êtes ?</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { id: 'public', label: 'Public', icon: Users },
                                    { id: 'artiste', label: 'Artiste', icon: User },
                                    { id: 'promoteur culturel', label: 'Promoteur', icon: Briefcase },
                                    { id: 'influenceur', label: 'Influenceur', icon: Star },
                                    { id: 'entreprise culturel', label: 'Entreprise', icon: Building2 },
                                    { id: 'créateur de contenu', label: 'Créateur', icon: Video },
                                    { id: 'espace de loisir', label: 'Espace Loisir', icon: Tent },
                                    { id: 'centre culturel', label: 'Centre Culturel', icon: Building }
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: role.id })}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${formData.role === role.id
                                            ? 'border-[var(--marketing-orange)] bg-[var(--marketing-orange)]/5 text-[var(--marketing-orange)]'
                                            : 'border-gray-50 hover:border-gray-200 text-gray-500'
                                            }`}
                                    >
                                        <role.icon size={20} />
                                        <span className="text-[10px] font-bold text-center leading-tight">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-4 rounded-xl shadow-lg shadow-[var(--marketing-orange)]/20"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Créer mon compte"}
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                        <p className="text-gray-600 text-sm">
                            Déjà un compte ?{' '}
                            <Link href="/login" className="text-[var(--marketing-orange)] font-bold hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
