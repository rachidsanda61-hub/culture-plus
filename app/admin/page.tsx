
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            // Dans une vraie app, on utiliserait un cookie ou JWT
            localStorage.setItem('isAdmin', 'true');
            router.push('/admin/dashboard');
        } else {
            setError('Mot de passe incorrect');
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--sand-50)]">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-[var(--marketing-orange)] rounded-full flex items-center justify-center text-white mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-2xl font-bold">Connexion Admin</h1>
                    <p className="text-gray-500">Culture+ Administration</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--marketing-orange)] focus:border-transparent outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button className="w-full justify-center">Se connecter</Button>
                </form>
            </div>
        </main>
    );
}
