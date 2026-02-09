'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfiles } from '@/context/ProfilesContext';
import { updateRole } from '@/app/actions/profiles';
import { Button } from '@/components/Button';
import { ImageUpload } from '@/components/ImageUpload';
import { User, MapPin, TextQuote, Loader2, ArrowLeft, Save, Lock, Mail, BadgeCheck, Users, Briefcase, Star, Building2, Video, Tent, Building } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ProfileSettingsPage() {
    const { user, changePassword: changePasswordAuth } = useAuth();
    const { updateProfile, getProfileById } = useProfiles();

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        image: '',
        tags: ''
    });

    const [selectedRole, setSelectedRole] = useState(user?.role || 'public');

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPwd, setIsChangingPwd] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        if (user) {
            const profile = getProfileById(user.id);
            if (profile) {
                setFormData({
                    name: profile.name || '',
                    bio: profile.bio || '',
                    location: profile.location || '',
                    image: profile.image || '',
                    tags: profile.tags ? profile.tags.join(', ') : ''
                });
            }
        }
    }, [user, getProfileById]);

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role);
        }
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <p className="mb-4">Veuillez vous connecter pour accéder à cette page.</p>
                    <Link href="/login">
                        <Button>Se connecter</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({
                name: formData.name,
                bio: formData.bio,
                location: formData.location,
                image: formData.image,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== '')
            });
            toast.success('Profil mis à jour');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error('Les nouveaux mots de passe ne correspondent pas');
            return;
        }
        setIsChangingPwd(true);
        try {
            await changePasswordAuth(passwords.current, passwords.new);
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            // Toast is handled in context
        } finally {
            setIsChangingPwd(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = async (newRole: string) => {
        if (!user) return;
        try {
            await updateRole(user.id, newRole);
            setSelectedRole(newRole);
            toast.success('Catégorie mise à jour');
            // Update local storage
            const updatedUser = { ...user, role: newRole };
            localStorage.setItem('culture_plus_user', JSON.stringify(updatedUser));
            window.location.reload(); // Refresh to update UI
        } catch (error) {
            toast.error('Erreur lors de la mise à jour de la catégorie');
        }
    };

    const handleImageChange = (base64: string) => {
        setFormData({ ...formData, image: base64 });
    };

    return (
        <main className="min-h-screen pt-24 pb-20 bg-[var(--sand-50)]">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <Link href={user.role === 'public' ? '/' : `/network/${user.id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--marketing-orange)] transition-colors">
                        <ArrowLeft size={20} /> Retour au profil
                    </Link>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <BadgeCheck size={14} className="text-blue-500" /> Compte {user.role}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Photo Selection */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            <h3 className="font-bold mb-6 text-center">Photo de profil</h3>
                            <ImageUpload
                                value={formData.image}
                                onChange={handleImageChange}
                                onRemove={() => setFormData({ ...formData, image: '' })}
                                label=""
                            />
                            <p className="text-xs text-gray-400 mt-4 text-center">
                                Cette photo sera visible par tous les membres du réseau.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 italic text-gray-500 text-sm">
                            <p><strong>Note :</strong> Seuls les Artistes et Promoteurs sont visibles dans le Réseau Culture+.</p>
                        </div>
                    </div>

                    {/* Main Content Areas */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Info Form */}
                        <section className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold mb-8">Informations de base</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Email (non modifiable)</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                disabled
                                                value={user.email}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                                            />
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Nom Complet</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20"
                                            />
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Localisation</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="Ex: Niamey, Niger"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20"
                                        />
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Bio professionnelle</label>
                                    <div className="relative">
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 resize-none"
                                        />
                                        <TextQuote className="absolute left-4 top-4 text-gray-400" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Catégorie professionnelle</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                                                onClick={() => handleRoleChange(role.id)}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${selectedRole === role.id
                                                    ? 'border-[var(--marketing-orange)] bg-[var(--marketing-orange)]/5 text-[var(--marketing-orange)]'
                                                    : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                                    }`}
                                            >
                                                <role.icon size={16} />
                                                <span className="text-[9px] font-bold text-center leading-tight">{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Votre catégorie détermine votre visibilité dans le réseau.</p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full md:w-auto px-12 py-4 rounded-xl gap-2 justify-center shadow-lg shadow-[var(--marketing-orange)]/20"
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Sauvegarder</>}
                                </Button>
                            </form>
                        </section>

                        {/* Security Form */}
                        <section className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold mb-8">Sécurité du compte</h2>
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Mot de passe actuel</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            value={passwords.current}
                                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20"
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            value={passwords.new}
                                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                            placeholder="Minimum 6 caractères"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            value={passwords.confirm}
                                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="show-passwords"
                                        checked={showPasswords}
                                        onChange={(e) => setShowPasswords(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-[var(--marketing-orange)] focus:ring-[var(--marketing-orange)] cursor-pointer"
                                    />
                                    <label htmlFor="show-passwords" className="text-xs text-gray-500 cursor-pointer select-none">
                                        Voir les mots de passe
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full md:w-auto px-8 py-4 rounded-xl gap-2 justify-center"
                                    disabled={isChangingPwd || !passwords.new}
                                >
                                    {isChangingPwd ? <Loader2 className="animate-spin" size={20} /> : "Modifier le mot de passe"}
                                </Button>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
