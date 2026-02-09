'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(email, password);
        setIsLoading(false);
        if (success) {
            router.push('/');
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12 bg-[var(--sand-50)] flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--marketing-orange)] mb-8 transition-colors">
                    <ArrowLeft size={20} /> Retour à l'accueil
                </Link>

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold mb-2">Connexion</h1>
                        <p className="text-gray-500 text-sm">Heureux de vous revoir sur Culture+</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemple@mail.com"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                                <Link href="#" className="text-xs text-[var(--marketing-orange)] hover:underline">Oublié ?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                    Afficher le mot de passe
                                </label>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-4 rounded-xl shadow-lg shadow-[var(--marketing-orange)]/20"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Se connecter'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                        <p className="text-gray-600 text-sm">
                            Pas encore de compte ?{' '}
                            <Link href="/register" className="text-[var(--marketing-orange)] font-bold hover:underline">
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
