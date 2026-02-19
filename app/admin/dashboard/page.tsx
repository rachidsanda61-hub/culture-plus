'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/context/EventsContext';
import { useOpportunities } from '@/context/OpportunitiesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import {
    Trash2, Plus, LayoutDashboard, LogOut, Briefcase,
    Calendar, Users, Image as ImageIcon, Megaphone,
    Handshake, ExternalLink, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/ImageUpload';
import { getHeroSlides, addHeroSlide, deleteHeroSlide } from '@/app/actions/carousel';
import { getPartners, addPartner, deletePartner, getAds, addAd, deleteAd } from '@/app/actions/ads';
import { getAllUsers, adminDeleteUser, adminToggleVerify, adminUpdateProfileType } from '@/app/actions/admin';
import { ProfileType } from '@prisma/client';
import { BadgeCheck, ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const TYPE_COLORS: Record<ProfileType, string> = {
    [ProfileType.INDIVIDUAL]: 'bg-orange-100 text-orange-700',
    [ProfileType.INTERNATIONAL_ORGANIZATION]: 'bg-blue-100 text-blue-700',
    [ProfileType.DIPLOMATIC_ORGANIZATION]: 'bg-amber-100 text-amber-700',
    [ProfileType.STATE_SERVICE]: 'bg-red-100 text-red-700',
    [ProfileType.NIGHT_CLUB]: 'bg-purple-100 text-purple-700',
    [ProfileType.RESTAURANT]: 'bg-emerald-100 text-emerald-700',
    [ProfileType.HOTEL]: 'bg-teal-100 text-teal-700',
    [ProfileType.CULTURAL_ENTERPRISE]: 'bg-indigo-100 text-indigo-700',
    [ProfileType.ASSOCIATION_NGO]: 'bg-pink-100 text-pink-700',
};

export default function AdminDashboard() {
    const { events, deleteEvent } = useEvents();
    const { opportunities, deleteOpportunity } = useOpportunities();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'events' | 'opportunities' | 'carousel' | 'partners' | 'users'>('events');

    const [heroSlides, setHeroSlides] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [ads, setAds] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Upload states
    const [heroImage, setHeroImage] = useState<string | null>(null);
    const [partnerLogo, setPartnerLogo] = useState<string | null>(null);
    const [adImage, setAdImage] = useState<string | null>(null);

    useEffect(() => {
        if (!user || (user as any).appRole !== 'ADMIN') {
            router.push('/login');
            return;
        }
        loadAllAdminData();
    }, [user, router]);

    const loadAllAdminData = async () => {
        if (!user) return;
        setIsLoadingData(true);
        try {
            const [s, p, a, u] = await Promise.all([
                getHeroSlides(),
                getPartners(),
                getAds(),
                getAllUsers(user.id)
            ]);
            setHeroSlides(s);
            setPartners(p);
            setAds(a);
            setAllUsers(u);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleAddHero = async (e: any) => {
        e.preventDefault();
        if (!heroImage) return alert("Veuillez sélectionner une image");
        const form = e.target;
        const data = {
            image: heroImage,
            title: form.title.value,
            order: parseInt(form.order.value || '0')
        };
        await addHeroSlide(user!.id, 'ADMIN', data);
        form.reset();
        setHeroImage(null);
        loadAllAdminData();
    };

    const handleDeleteUser = async (uid: string) => {
        if (confirm('Supprimer définitivement cet utilisateur ?')) {
            await adminDeleteUser(user!.id, uid);
            loadAllAdminData();
        }
    };

    const handleToggleVerify = async (uid: string, currentStatus: boolean) => {
        try {
            await adminToggleVerify(user!.id, uid, !currentStatus);
            loadAllAdminData();
        } catch (error) {
            alert("Erreur lors de la vérification");
        }
    };

    const handleUpdateType = async (uid: string, type: ProfileType) => {
        try {
            await adminUpdateProfileType(user!.id, uid, type);
            loadAllAdminData();
        } catch (error) {
            alert("Erreur lors de la mise à jour du type");
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 md:flex flex-col hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 font-black text-xl text-[var(--marketing-orange)]">
                        <LayoutDashboard size={24} />
                        <span>C+ ADMIN</span>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {[
                        { id: 'events', label: 'Événements', icon: Calendar },
                        { id: 'opportunities', label: 'Opportunités', icon: Briefcase },
                        { id: 'carousel', label: 'Carrousel Hero', icon: ImageIcon },
                        { id: 'partners', label: 'Partenaires & Pubs', icon: Megaphone },
                        { id: 'users', label: 'Utilisateurs', icon: Users },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                ? "bg-[var(--marketing-orange)] text-white shadow-md"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium">
                        <LogOut size={20} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="outline" size="sm">Voir le site</Button>
                        </Link>
                        <div className="w-8 h-8 rounded-full bg-[var(--marketing-orange)]/10 text-[var(--marketing-orange)] flex items-center justify-center font-bold">
                            {user?.name?.[0] || 'A'}
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-6xl w-full mx-auto">
                    {isLoadingData ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={40} /></div>
                    ) : (
                        <>
                            {activeTab === 'events' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">Modération Événements</h2>
                                        <Link href="/events/submit"><Button className="gap-2"><Plus size={18} /> Créer un événement</Button></Link>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Événement</th>
                                                    <th className="px-6 py-4">Lieu</th>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {events.map(ev => (
                                                    <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{ev.title}</td>
                                                        <td className="px-6 py-4 text-gray-600">{ev.location}</td>
                                                        <td className="px-6 py-4 text-gray-600">{ev.date}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button title="Supprimer l'événement" onClick={() => deleteEvent(ev.slug)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'opportunities' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold">Modération Opportunités</h2>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Titre</th>
                                                    <th className="px-6 py-4">Auteur</th>
                                                    <th className="px-6 py-4">Catégorie</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {opportunities.map(opp => (
                                                    <tr key={opp.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{opp.title}</td>
                                                        <td className="px-6 py-4 text-gray-600">{opp.author.name}</td>
                                                        <td className="px-6 py-4 text-gray-600 capitalize">{opp.category}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button title="Supprimer l'opportunité" onClick={() => deleteOpportunity(opp.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'carousel' && (
                                <div className="space-y-8">
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <h2 className="text-xl font-bold mb-6">Ajouter un Slide</h2>
                                        <form onSubmit={handleAddHero} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Titre (Optionnel)</label>
                                                    <input name="title" title="Titre du slide" placeholder="Titre..." className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700">Ordre</label>
                                                    <input name="order" title="Ordre d'affichage" type="number" defaultValue="0" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]" />
                                                </div>
                                            </div>

                                            <ImageUpload
                                                label="Photo du Slide"
                                                value={heroImage}
                                                onChange={setHeroImage}
                                                onRemove={() => setHeroImage(null)}
                                                aspectRatio="video"
                                            />

                                            <Button type="submit" className="w-full justify-center py-4 rounded-2xl">Enregistrer le slide</Button>
                                        </form>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {heroSlides.map(slide => (
                                            <div key={slide.id} className="relative aspect-video rounded-3xl overflow-hidden group shadow-md border border-gray-100">
                                                <img src={slide.image} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button title="Supprimer le slide" onClick={() => { if (confirm('Supprimer?')) deleteHeroSlide(user!.id, 'ADMIN', slide.id).then(loadAllAdminData) }} className="self-end p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"><Trash2 size={20} /></button>
                                                    <h3 className="text-white font-bold text-xl">{slide.title || 'Sans titre'}</h3>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'partners' && (
                                <div className="space-y-12">
                                    {/* PARTNERS */}
                                    <div className="space-y-6">
                                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Handshake className="text-[var(--marketing-orange)]" /> Ajouter un Partenaire</h2>
                                            <form onSubmit={async (e: any) => {
                                                e.preventDefault();
                                                if (!partnerLogo) return alert("Veuillez sélectionner un logo");
                                                const f = e.target;
                                                await addPartner('ADMIN', {
                                                    name: f.name.value,
                                                    logo: partnerLogo,
                                                    link: f.link.value,
                                                    order: parseInt(f.order.value || '0')
                                                });
                                                f.reset();
                                                setPartnerLogo(null);
                                                loadAllAdminData();
                                            }} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input required name="name" title="Nom du partenaire" placeholder="Nom du partenaire" className="px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]" />
                                                    <input name="link" title="Lien partenaire" placeholder="Lien (optionnel)" className="px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]" />
                                                    <input name="order" title="Ordre d'affichage" type="number" placeholder="Ordre" className="px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[var(--marketing-orange)] md:col-span-2" />
                                                </div>

                                                <ImageUpload
                                                    label="Logo du Partenaire"
                                                    value={partnerLogo}
                                                    onChange={setPartnerLogo}
                                                    onRemove={() => setPartnerLogo(null)}
                                                    aspectRatio="square"
                                                />

                                                <Button type="submit" className="w-full rounded-xl py-4">Enregistrer</Button>
                                            </form>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {partners.map(p => (
                                                <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 relative group">
                                                    <img src={p.logo} alt={p.name} className="w-full aspect-square object-contain" />
                                                    <button onClick={() => deletePartner('ADMIN', p.id).then(loadAllAdminData)} className="absolute top-2 right-2 p-1 bg-red-100 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ADS */}
                                    <div className="space-y-6">
                                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Megaphone className="text-[var(--marketing-orange)]" /> Ajouter une Publicité (Bannière)</h2>
                                            <form onSubmit={async (e: any) => {
                                                e.preventDefault();
                                                if (!adImage) return alert("Veuillez sélectionner une image");
                                                const f = e.target;
                                                await addAd('ADMIN', {
                                                    title: f.title.value,
                                                    image: adImage,
                                                    link: f.link.value,
                                                    order: parseInt(f.order.value || '0')
                                                });
                                                f.reset();
                                                setAdImage(null);
                                                loadAllAdminData();
                                            }} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input name="title" title="Titre de la publicité" placeholder="Titre (interne)" className="px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]" />
                                                    <input name="link" title="Lien de redirection" placeholder="Lien de redirection" className="px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[var(--marketing-orange)]" />
                                                    <input name="order" title="Ordre d'affichage" type="number" placeholder="Ordre" className="px-4 py-3 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[var(--marketing-orange)] md:col-span-2" />
                                                </div>

                                                <ImageUpload
                                                    label="Image de la publicité"
                                                    value={adImage}
                                                    onChange={setAdImage}
                                                    onRemove={() => setAdImage(null)}
                                                    aspectRatio="video"
                                                />

                                                <Button type="submit" className="w-full rounded-xl py-4">Enregistrer</Button>
                                            </form>
                                        </div>
                                        <div className="space-y-4">
                                            {ads.map(ad => (
                                                <div key={ad.id} className="relative aspect-[4/1] md:aspect-[8/1] rounded-2xl overflow-hidden group">
                                                    <img src={ad.image} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-8">
                                                        <span className="text-white font-bold">{ad.title}</span>
                                                        <button title="Supprimer la publicité" onClick={() => deleteAd('ADMIN', ad.id).then(loadAllAdminData)} className="p-2 bg-red-500 text-white rounded-xl"><Trash2 size={20} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold">Gestion Utilisateurs</h2>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Utilisateur</th>
                                                    <th className="px-6 py-4">Type de Profil</th>
                                                    <th className="px-6 py-4">Vérifié</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {allUsers.map(u => (
                                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shadow-inner">
                                                                    {u.image && <img src={u.image} alt="" className="w-full h-full object-cover" />}
                                                                </div>
                                                                <div>
                                                                    <span className="font-bold text-gray-900 block">{u.name || 'Sans nom'}</span>
                                                                    <span className="text-xs text-gray-400">{u.email}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                title="Changer le type de profil"
                                                                value={u.profile_type}
                                                                onChange={(e) => handleUpdateType(u.id, e.target.value as ProfileType)}
                                                                className={`text-[10px] font-black uppercase px-2 py-1 rounded border-none appearance-none cursor-pointer focus:ring-2 focus:ring-[var(--marketing-orange)]/20 ${TYPE_COLORS[u.profile_type as ProfileType] || 'bg-gray-100 text-gray-600'}`}
                                                            >
                                                                {(Object.values(ProfileType) as ProfileType[]).map(type => (
                                                                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => handleToggleVerify(u.id, u.verified_status)}
                                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${u.verified_status ? 'bg-blue-100 text-blue-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-700'}`}
                                                            >
                                                                {u.verified_status ? (
                                                                    <><BadgeCheck size={14} /> Vérifié</>
                                                                ) : (
                                                                    <><ShieldAlert size={14} /> Non vérifié</>
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {u.id !== user?.id && (
                                                                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Supprimer l'utilisateur">
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                )}
                                                                <Link href={`/network/${u.id}`} target="_blank">
                                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Voir le profil">
                                                                        <ExternalLink size={18} />
                                                                    </button>
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

