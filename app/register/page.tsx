'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import Link from 'next/link';
import {
    Mail, Lock, User, Phone, Loader2, ArrowLeft,
    Globe, Flag, Landmark, Music, Utensils,
    Hotel, Building2, Heart, CheckCircle2,
    ChevronRight, MapPin, Globe as WebsiteIcon, Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProfileType } from '@prisma/client';

const PROFILE_TYPES = [
    {
        id: ProfileType.INDIVIDUAL,
        label: 'Particulier',
        icon: User,
        desc: 'Artiste, créateur, ou simple passionné de culture.'
    },
    {
        id: ProfileType.INTERNATIONAL_ORGANIZATION,
        label: 'Organisation Internationale',
        icon: Globe,
        desc: 'Agences de l’ONU, institutions mondiales ou régionales.'
    },
    {
        id: ProfileType.DIPLOMATIC_ORGANIZATION,
        label: 'Ambassade / Diplomatie',
        icon: Flag,
        desc: 'Ambassades, consulats et missions diplomatiques.'
    },
    {
        id: ProfileType.STATE_SERVICE,
        label: 'Service de l’État',
        icon: Landmark,
        desc: 'Ministères, directions et services publics.'
    },
    {
        id: ProfileType.NIGHT_CLUB,
        label: 'Boîte de nuit',
        icon: Music,
        desc: 'Établissements de divertissement nocturne.'
    },
    {
        id: ProfileType.RESTAURANT,
        label: 'Restaurant',
        icon: Utensils,
        desc: 'Gastronomie et restauration.'
    },
    {
        id: ProfileType.HOTEL,
        label: 'Hôtel',
        icon: Hotel,
        desc: 'Hébergement et hôtellerie.'
    },
    {
        id: ProfileType.CULTURAL_ENTERPRISE,
        label: 'Entreprise Culturelle',
        icon: Building2,
        desc: 'Agences, galeries, labels et entreprises privées.'
    },
    {
        id: ProfileType.ASSOCIATION_NGO,
        label: 'Association / ONG',
        icon: Heart,
        desc: 'Organisations à but non lucratif et associations.'
    },
];

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        profile_type: ProfileType.INDIVIDUAL as ProfileType,
        organization_name: '',
        country: '',
        city: '',
        official_website: '',
        address: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const isOrganization = formData.profile_type !== ProfileType.INDIVIDUAL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register({
                ...formData,
                role: formData.profile_type.toLowerCase().replace(/_/g, ' ')
            });
            router.push('/');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center px-4">
            <div className={`max-w-${step === 2 ? '4xl' : 'xl'} w-full transition-all duration-300`}>
                <div className="flex justify-between items-center mb-8">
                    {step > 1 ? (
                        <button
                            onClick={prevStep}
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--marketing-orange)] transition-colors text-sm font-medium"
                        >
                            <ArrowLeft size={18} /> Retour
                        </button>
                    ) : (
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--marketing-orange)] transition-colors text-sm font-medium">
                            <ArrowLeft size={18} /> Accueil
                        </Link>
                    )}

                    <div className="flex gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 w-8 rounded-full transition-all duration-500 ${s <= step ? 'bg-[var(--marketing-orange)]' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 border border-gray-100 overflow-hidden relative">
                    {/* Step Content */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right duration-500">
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold mb-2">Commençons par le début</h1>
                                <p className="text-gray-500">Créez vos identifiants de connexion</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom Complet</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Votre nom ou nom d'usage"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="exemple@mail.com"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="mt-2 text-xs text-gray-400 hover:text-[var(--marketing-orange)] font-medium"
                                    >
                                        {showPassword ? 'Masquer' : 'Afficher'} le mot de passe
                                    </button>
                                </div>

                                <Button
                                    onClick={nextStep}
                                    className="w-full py-5 rounded-2xl shadow-xl shadow-[var(--marketing-orange)]/20 text-lg font-bold gap-2"
                                    disabled={!formData.name || !formData.email || !formData.password}
                                >
                                    Continuer <ChevronRight size={20} />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right duration-500">
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold mb-2">Quel type de profil vous correspond ?</h1>
                                <p className="text-gray-500">Sélectionnez la catégorie qui définit le mieux votre activité</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                                {PROFILE_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, profile_type: type.id })}
                                        className={`group relative flex flex-col items-start p-6 rounded-3xl border-2 text-left transition-all duration-300 ${formData.profile_type === type.id
                                            ? 'border-[var(--marketing-orange)] bg-[var(--marketing-orange)]/5 ring-4 ring-[var(--marketing-orange)]/10'
                                            : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-2xl mb-4 transition-colors ${formData.profile_type === type.id ? 'bg-[var(--marketing-orange)] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                                            <type.icon size={24} />
                                        </div>
                                        <h3 className={`font-bold mb-1 ${formData.profile_type === type.id ? 'text-[var(--marketing-orange)]' : 'text-gray-900'}`}>{type.label}</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed">{type.desc}</p>
                                        {formData.profile_type === type.id && (
                                            <CheckCircle2 className="absolute top-4 right-4 text-[var(--marketing-orange)]" size={20} />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <Button
                                onClick={nextStep}
                                className="w-full py-5 rounded-2xl shadow-xl shadow-[var(--marketing-orange)]/20 text-lg font-bold gap-2"
                            >
                                Suivant <ChevronRight size={20} />
                            </Button>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold mb-2">Dernière étape !</h1>
                                <p className="text-gray-500">Complétez ces informations pour finaliser votre inscription</p>
                            </div>

                            <div className="space-y-5">
                                {isOrganization && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nom de l'Organisation / Établissement</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="organization_name"
                                                required
                                                value={formData.organization_name}
                                                onChange={handleChange}
                                                placeholder="Ex: Ambassade de France, Hôtel Radisson..."
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                            />
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Pays</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="country"
                                                required
                                                value={formData.country}
                                                onChange={handleChange}
                                                placeholder="Ex: Niger"
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                            />
                                            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Ville</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="city"
                                                required
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="Ex: Niamey"
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                            />
                                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {isOrganization && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Adresse physique</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Ex: Quartier Plateau, Rue de l'Indépendance"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                                />
                                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Site Web Officiel (Optionnel)</label>
                                            <div className="relative">
                                                <input
                                                    type="url"
                                                    name="official_website"
                                                    value={formData.official_website}
                                                    onChange={handleChange}
                                                    placeholder="https://www.exemple.com"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                                />
                                                <WebsiteIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+227 -- -- -- --"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]/20 focus:border-[var(--marketing-orange)] transition-all"
                                        />
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-5 rounded-2xl shadow-xl shadow-[var(--marketing-orange)]/20 text-lg font-bold"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Créer mon compte"}
                                </Button>

                                <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                                    <Info size={12} /> Vos informations seront vérifiées par notre équipe pour garantir l'intégrité de la plateforme.
                                </p>
                            </div>
                        </form>
                    )}

                    <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                        <p className="text-gray-600 text-sm">
                            Déjà membre ?{' '}
                            <Link href="/login" className="text-[var(--marketing-orange)] font-bold hover:underline">
                                Connectez-vous ici
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">© 2026 Culture+. Tous droits réservés.</p>
                </div>
            </div>
        </main>
    );
}

